import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { milestones } from "@/lib/db/schema";

/**
 * Upserts a single running-streak milestone row per couple per label (e.g.
 * "goodnight streak") — one row that keeps advancing, not a new row every
 * night. Returns the new count.
 */
export async function bumpStreak(coupleId: string, label: string): Promise<number> {
  const db = getDb();
  const [existing] = await withDbRetry(() =>
    db
      .select()
      .from(milestones)
      .where(and(eq(milestones.coupleId, coupleId), eq(milestones.label, label), eq(milestones.isStreak, true)))
      .limit(1),
  );

  const todayIso = new Date().toISOString().slice(0, 10);
  const nextCount = (existing?.streakCount ?? 0) + 1;

  if (existing) {
    await withDbRetry(() =>
      db
        .update(milestones)
        .set({ streakCount: nextCount, achievedAt: todayIso })
        .where(eq(milestones.id, existing.id)),
    );
  } else {
    await withDbRetry(() =>
      db.insert(milestones).values({
        coupleId,
        label,
        achievedAt: todayIso,
        isStreak: true,
        streakCount: nextCount,
      }),
    );
  }

  return nextCount;
}
