"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { sparkAnswers } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import type { MutualEntry } from "@/lib/reveal/useMutualReveal";

type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitSparkAnswer(
  coupleId: string,
  promptId: string,
  answer: string,
): Promise<SubmitResult> {
  const trimmed = answer.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .insert(sparkAnswers)
      .values({ coupleId, promptId, authorId: userId, answer: trimmed })
      .onConflictDoNothing({
        target: [sparkAnswers.coupleId, sparkAnswers.promptId, sparkAnswers.authorId],
      })
      .returning(),
  );
  if (!row) return { ok: true }; // already answered today — no-op, not an error

  const event: MutualEntry = { authorId: userId, key: promptId, text: trimmed };
  await triggerCoupleEvent(coupleId, "spark:submitted", event);
  return { ok: true };
}
