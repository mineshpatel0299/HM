import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { milestones } from "@/lib/db/schema";

export type MilestoneRow = {
  id: string;
  label: string;
  achievedAt: string;
  isStreak: boolean;
  streakCount: number | null;
};

export async function getMilestones(coupleId: string, limit = 10): Promise<MilestoneRow[]> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(milestones)
      .where(eq(milestones.coupleId, coupleId))
      .orderBy(desc(milestones.achievedAt))
      .limit(limit),
  );
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    achievedAt: row.achievedAt,
    isStreak: row.isStreak,
    streakCount: row.streakCount,
  }));
}
