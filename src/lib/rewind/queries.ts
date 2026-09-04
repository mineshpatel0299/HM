import "server-only";
import { and, eq, gte, lt } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { subWeeks } from "date-fns";
import { getDb, withDbRetry } from "@/lib/db/client";
import { moments, photos, sparkAnswers } from "@/lib/db/schema";
import { getPromptForDate } from "@/lib/spark/prompts";
import { getPublicUrl } from "@/lib/storage/r2";
import type { RewindItem } from "./types";

function utcDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

async function getRewindItemForWeek(coupleId: string, weeksAgo: number): Promise<RewindItem | null> {
  const targetDate = subWeeks(new Date(), weeksAgo);
  const dateKey = formatInTimeZone(targetDate, "UTC", "yyyy-MM-dd");
  const { start, end } = utcDayBounds(targetDate);
  const db = getDb();

  const [moment] = await withDbRetry(() =>
    db
      .select()
      .from(moments)
      .where(and(eq(moments.coupleId, coupleId), gte(moments.createdAt, start), lt(moments.createdAt, end)))
      .limit(1),
  );
  if (moment) {
    return { kind: "moment", id: moment.id, text: moment.text, mood: moment.mood, authorId: moment.authorId, date: dateKey };
  }

  const [photo] = await withDbRetry(() =>
    db
      .select()
      .from(photos)
      .where(and(eq(photos.coupleId, coupleId), gte(photos.createdAt, start), lt(photos.createdAt, end)))
      .limit(1),
  );
  if (photo) {
    return {
      kind: "photo",
      id: photo.id,
      publicUrl: getPublicUrl(photo.r2Key),
      caption: photo.caption,
      date: dateKey,
    };
  }

  // Spark prompts are keyed by their date (Phase 7 convention), so the
  // promptId for "N weeks ago" is just that date's key.
  const sparkRows = await withDbRetry(() =>
    db
      .select()
      .from(sparkAnswers)
      .where(and(eq(sparkAnswers.coupleId, coupleId), eq(sparkAnswers.promptId, dateKey))),
  );
  if (sparkRows.length >= 2) {
    return {
      kind: "spark",
      id: dateKey,
      promptText: getPromptForDate(targetDate).text,
      answers: sparkRows.map((row) => ({ authorId: row.authorId, text: row.answer })),
      date: dateKey,
    };
  }

  return null;
}

/**
 * "Start with a simple 'N weeks ago' job, expandable later" — checks each
 * of the last `maxWeeks` week-multiples for content and surfaces one item
 * per week that has any, most recent first.
 */
export async function getRewindItems(coupleId: string, maxWeeks = 6): Promise<RewindItem[]> {
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);
  const results = await Promise.all(weeks.map((weeksAgo) => getRewindItemForWeek(coupleId, weeksAgo)));
  return results.filter((item): item is RewindItem => item !== null);
}
