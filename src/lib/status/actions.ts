"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { liveStatus } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import type { LiveStatusEvent } from "./types";

type SetStatusResult = { ok: true } | { ok: false; error: string };

export async function setMyStatus(coupleId: string, status: string): Promise<SetStatusResult> {
  const trimmed = status.trim();
  if (!trimmed) return { ok: false, error: "Status can't be empty." };
  if (trimmed.length > 60) return { ok: false, error: "Keep it under 60 characters." };

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .insert(liveStatus)
      .values({ profileId: userId, coupleId, status: trimmed })
      .onConflictDoUpdate({
        target: liveStatus.profileId,
        set: { status: trimmed, updatedAt: new Date() },
      })
      .returning(),
  );

  const event: LiveStatusEvent = {
    profileId: row.profileId,
    coupleId: row.coupleId,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };

  await triggerCoupleEvent(coupleId, "status:updated", event);
  return { ok: true };
}
