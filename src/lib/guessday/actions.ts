"use server";

import { eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { guessPredictions } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";

type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitPrediction(
  coupleId: string,
  predictDate: string,
  prediction: string,
): Promise<SubmitResult> {
  const trimmed = prediction.trim();
  if (!trimmed) return { ok: false, error: "Write a guess first." };

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .insert(guessPredictions)
      .values({ coupleId, predictDate, authorId: userId, prediction: trimmed })
      .onConflictDoNothing({
        target: [guessPredictions.coupleId, guessPredictions.predictDate, guessPredictions.authorId],
      })
      .returning(),
  );
  if (!row) return { ok: false, error: "You already guessed for today." };

  await triggerCoupleEvent(coupleId, "guessday:submitted", {
    id: row.id,
    authorId: userId,
    predictDate,
    prediction: trimmed,
  });
  return { ok: true };
}

type ScoreResult = { ok: true } | { ok: false; error: string };

/** Only the person the prediction was ABOUT can score it — not its author. */
export async function scorePrediction(
  coupleId: string,
  predictionId: string,
  actual: string,
  correct: boolean,
): Promise<ScoreResult> {
  const trimmedActual = actual.trim();
  if (!trimmedActual) return { ok: false, error: "Say what actually happened." };

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [existing] = await withDbRetry(() =>
    db.select().from(guessPredictions).where(eq(guessPredictions.id, predictionId)).limit(1),
  );
  if (!existing || existing.coupleId !== coupleId) {
    return { ok: false, error: "That prediction doesn't exist." };
  }
  if (existing.authorId === userId) {
    return { ok: false, error: "Only the person it's about can score it." };
  }

  const [updated] = await withDbRetry(() =>
    db
      .update(guessPredictions)
      .set({ actual: trimmedActual, correct })
      .where(eq(guessPredictions.id, predictionId))
      .returning(),
  );

  await triggerCoupleEvent(coupleId, "guessday:scored", {
    predictionId,
    actual: updated.actual,
    correct: updated.correct,
    authorId: updated.authorId,
  });
  return { ok: true };
}
