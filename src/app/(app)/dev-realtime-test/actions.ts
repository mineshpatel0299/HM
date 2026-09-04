"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";

export async function sendTestPing(coupleId: string, fromName: string): Promise<void> {
  await assertCoupleMember(coupleId);
  await triggerCoupleEvent(coupleId, "ping:test", {
    fromName,
    sentAt: new Date().toISOString(),
  });
}
