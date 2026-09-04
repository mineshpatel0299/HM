"use server";

import { eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { truthLadderProgress } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import { LADDER_LEVELS } from "./levels";

type AckResult =
  | { ok: true; currentLevel: number; ackedBy: string[] }
  | { ok: false; error: string };

export async function ackCurrentLevel(coupleId: string): Promise<AckResult> {
  const { userId } = await assertCoupleMember(coupleId);
  const db = getDb();

  // Upsert that always returns a row, whether this is the first ack ever
  // (insert) or a later one (conflict) — the "set" is a no-op, just there
  // to force RETURNING on the conflict path too.
  const [progress] = await withDbRetry(() =>
    db
      .insert(truthLadderProgress)
      .values({ coupleId, currentLevel: 1, ackedBy: [] })
      .onConflictDoUpdate({
        target: truthLadderProgress.coupleId,
        set: { coupleId },
      })
      .returning(),
  );

  // Ladder's already fully climbed — nothing left to ack.
  if (progress.currentLevel > LADDER_LEVELS.length) {
    return { ok: true, currentLevel: progress.currentLevel, ackedBy: progress.ackedBy };
  }
  if (progress.ackedBy.includes(userId)) {
    return { ok: true, currentLevel: progress.currentLevel, ackedBy: progress.ackedBy };
  }

  const ackedBy = [...progress.ackedBy, userId];
  const bothAcked = ackedBy.length >= 2;
  // Deliberately not clamped to LADDER_LEVELS.length: going one past it is
  // what distinguishes "ladder complete" from "on the last level, nobody's
  // acked it yet" — both would otherwise look identical once ackedBy resets.
  const currentLevel = bothAcked ? progress.currentLevel + 1 : progress.currentLevel;
  const nextAckedBy = bothAcked ? [] : ackedBy;

  const [updated] = await withDbRetry(() =>
    db
      .update(truthLadderProgress)
      .set({ currentLevel, ackedBy: nextAckedBy, updatedAt: new Date() })
      .where(eq(truthLadderProgress.coupleId, coupleId))
      .returning(),
  );

  await triggerCoupleEvent(coupleId, "truthladder:updated", {
    currentLevel: updated.currentLevel,
    ackedBy: updated.ackedBy,
  });

  return { ok: true, currentLevel: updated.currentLevel, ackedBy: updated.ackedBy };
}
