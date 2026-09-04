import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { guessPredictions } from "@/lib/db/schema";

export type PredictionRow = {
  id: string;
  authorId: string;
  prediction: string;
  actual: string | null;
  correct: boolean | null;
};

export type GuessDayState = {
  mine: PredictionRow | null;
  partnerRow: PredictionRow | null;
  myScore: number;
  partnerScore: number;
};

export async function getGuessDayState(
  coupleId: string,
  predictDate: string,
  myId: string,
  partnerId: string,
): Promise<GuessDayState> {
  const db = getDb();

  const rows = await withDbRetry(() =>
    db
      .select()
      .from(guessPredictions)
      .where(
        and(eq(guessPredictions.coupleId, coupleId), eq(guessPredictions.predictDate, predictDate)),
      ),
  );

  const scoreRows = await withDbRetry(() =>
    db
      .select({ authorId: guessPredictions.authorId, count: sql<number>`count(*)::int` })
      .from(guessPredictions)
      .where(and(eq(guessPredictions.coupleId, coupleId), eq(guessPredictions.correct, true)))
      .groupBy(guessPredictions.authorId),
  );

  const toRow = (r: (typeof rows)[number]): PredictionRow => ({
    id: r.id,
    authorId: r.authorId,
    prediction: r.prediction,
    actual: r.actual,
    correct: r.correct,
  });

  return {
    mine: rows.find((r) => r.authorId === myId) ? toRow(rows.find((r) => r.authorId === myId)!) : null,
    partnerRow: rows.find((r) => r.authorId === partnerId)
      ? toRow(rows.find((r) => r.authorId === partnerId)!)
      : null,
    myScore: scoreRows.find((r) => r.authorId === myId)?.count ?? 0,
    partnerScore: scoreRows.find((r) => r.authorId === partnerId)?.count ?? 0,
  };
}
