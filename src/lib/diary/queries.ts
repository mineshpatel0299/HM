import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { diaryEntries } from "@/lib/db/schema";

export type DiaryState = { myEntry: string | null; partnerEntry: string | null };

export async function getDiaryState(
  coupleId: string,
  myId: string,
  entryDate: string,
): Promise<DiaryState> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(diaryEntries)
      .where(and(eq(diaryEntries.coupleId, coupleId), eq(diaryEntries.entryDate, entryDate))),
  );

  const mine = rows.find((r) => r.authorId === myId) ?? null;
  const partnerRow = rows.find((r) => r.authorId !== myId) ?? null;

  return {
    myEntry: mine?.entry ?? null,
    partnerEntry: mine ? (partnerRow?.entry ?? null) : null,
  };
}
