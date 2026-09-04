import "server-only";
import { and, desc, eq, lte } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { timeCapsules } from "@/lib/db/schema";
import { getPublicUrl } from "@/lib/storage/r2";
import type { TimeCapsule } from "./types";

/**
 * No cron: the unlock check runs as part of this same query, every time
 * it's called. The UPDATE's RETURNING ids are exactly the capsules this
 * call flipped from locked to unlocked — that's what the client uses to
 * play the seal-breaking animation exactly once, not on every later visit.
 */
export async function getTimeCapsules(coupleId: string): Promise<TimeCapsule[]> {
  const db = getDb();

  const justUnlockedRows = await withDbRetry(() =>
    db
      .update(timeCapsules)
      .set({ unlocked: true })
      .where(
        and(
          eq(timeCapsules.coupleId, coupleId),
          eq(timeCapsules.unlocked, false),
          lte(timeCapsules.unlockAt, new Date()),
        ),
      )
      .returning({ id: timeCapsules.id }),
  );
  const justUnlockedIds = new Set(justUnlockedRows.map((row) => row.id));

  const rows = await withDbRetry(() =>
    db
      .select()
      .from(timeCapsules)
      .where(eq(timeCapsules.coupleId, coupleId))
      .orderBy(desc(timeCapsules.unlockAt)),
  );

  return rows.map((row) => ({
    id: row.id,
    coupleId: row.coupleId,
    authorId: row.authorId,
    content: row.unlocked ? row.content : null,
    publicUrl: row.unlocked && row.r2Key ? getPublicUrl(row.r2Key) : null,
    unlockAt: row.unlockAt.toISOString(),
    unlocked: row.unlocked,
    justUnlocked: justUnlockedIds.has(row.id),
    createdAt: row.createdAt.toISOString(),
  }));
}
