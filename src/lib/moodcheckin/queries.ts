import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { getDb, withDbRetry } from "@/lib/db/client";
import { moodCheckins } from "@/lib/db/schema";

export type TodayMood = { score: number | null; checkedInToday: boolean };

/** `null` timezone/authorId means "no one to check" — used for the partner
 * before pairing completes. */
export async function getTodayMood(
  coupleId: string,
  authorId: string,
  timezone: string,
): Promise<TodayMood> {
  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .select()
      .from(moodCheckins)
      .where(and(eq(moodCheckins.coupleId, coupleId), eq(moodCheckins.authorId, authorId)))
      .orderBy(desc(moodCheckins.createdAt))
      .limit(1),
  );
  if (!row) return { score: null, checkedInToday: false };

  const todayKey = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  const checkedInToday = formatInTimeZone(row.createdAt, timezone, "yyyy-MM-dd") === todayKey;
  return { score: checkedInToday ? row.moodScore : null, checkedInToday };
}
