"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getDb, withDbRetry } from "@/lib/db/client";
import { pings } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import type { PingEvent, PingKind, PingPayload } from "./types";

type SendPingResult = { ok: true } | { ok: false; error: string };

/**
 * Shared by PulseButton, HapticComposer, and HeartbeatShare — every
 * connection signal is an insert into `pings` plus one broadcast on the
 * couple's channel. to_id is always "whoever the current user isn't."
 */
export async function sendPing(
  coupleId: string,
  kind: PingKind,
  payload: PingPayload = null,
): Promise<SendPingResult> {
  const { userId } = await assertCoupleMember(coupleId);

  const context = await getCoupleContext();
  if (!context || context.coupleId !== coupleId || !context.partnerId) {
    return { ok: false, error: "Your partner hasn't joined yet." };
  }

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .insert(pings)
      .values({ coupleId, fromId: userId, toId: context.partnerId!, kind, payload })
      .returning(),
  );

  const event: PingEvent = {
    id: row.id,
    coupleId: row.coupleId,
    fromId: row.fromId,
    toId: row.toId,
    kind: row.kind as PingKind,
    payload: row.payload as PingPayload,
    createdAt: row.createdAt.toISOString(),
  };

  await triggerCoupleEvent(coupleId, "ping:new", event);
  return { ok: true };
}
