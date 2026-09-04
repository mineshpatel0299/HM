import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { sparkAnswers } from "@/lib/db/schema";

export type SparkState = { myAnswer: string | null; partnerAnswer: string | null };

/** Partner's answer is only ever returned once mine is in too — enforced
 * here, not just hidden client-side. */
export async function getSparkState(
  coupleId: string,
  myId: string,
  promptId: string,
): Promise<SparkState> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(sparkAnswers)
      .where(and(eq(sparkAnswers.coupleId, coupleId), eq(sparkAnswers.promptId, promptId))),
  );

  const mine = rows.find((r) => r.authorId === myId) ?? null;
  const partnerRow = rows.find((r) => r.authorId !== myId) ?? null;

  return {
    myAnswer: mine?.answer ?? null,
    partnerAnswer: mine ? (partnerRow?.answer ?? null) : null,
  };
}
