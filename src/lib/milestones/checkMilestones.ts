import "server-only";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { and, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { milestones } from "@/lib/db/schema";

const DAYS_TOGETHER_THRESHOLDS = [7, 30, 100, 200, 365, 500, 730, 1000, 1500, 2000];

/**
 * Opportunistic check, not a background job — called whenever the hero
 * loads. Idempotent: inserts a milestone row the first time a days-together
 * round number is crossed, no-ops if it's already been recorded.
 */
export async function checkDaysTogetherMilestones(coupleId: string, sinceDate: string | null) {
  if (!sinceDate) return;

  const days = differenceInCalendarDays(new Date(), parseISO(sinceDate)) + 1;
  const crossed = DAYS_TOGETHER_THRESHOLDS.filter((threshold) => days >= threshold);
  if (crossed.length === 0) return;

  const db = getDb();
  const existing = await withDbRetry(() =>
    db
      .select({ label: milestones.label })
      .from(milestones)
      .where(and(eq(milestones.coupleId, coupleId), eq(milestones.isStreak, false))),
  );
  const existingLabels = new Set(existing.map((row) => row.label));

  const toInsert = crossed
    .map((threshold) => `${threshold} days together`)
    .filter((label) => !existingLabels.has(label));

  if (toInsert.length === 0) return;

  const todayIso = new Date().toISOString().slice(0, 10);
  await withDbRetry(() =>
    db.insert(milestones).values(
      toInsert.map((label) => ({
        coupleId,
        label,
        achievedAt: todayIso,
        isStreak: false,
      })),
    ),
  );
}
