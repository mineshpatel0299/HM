"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getDb, withDbRetry } from "@/lib/db/client";
import { scheduledNotes } from "@/lib/db/schema";

type ScheduleResult = { ok: true } | { ok: false; error: string };

export async function scheduleNote(
  coupleId: string,
  text: string,
  sendAtIso: string,
): Promise<ScheduleResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };

  const sendAt = new Date(sendAtIso);
  if (Number.isNaN(sendAt.getTime()) || sendAt.getTime() <= Date.now()) {
    return { ok: false, error: "Pick a time in the future." };
  }

  const { userId } = await assertCoupleMember(coupleId);
  const context = await getCoupleContext();
  if (!context || context.coupleId !== coupleId || !context.partnerId) {
    return { ok: false, error: "Your partner hasn't joined yet." };
  }

  const db = getDb();
  await withDbRetry(() =>
    db.insert(scheduledNotes).values({
      coupleId,
      authorId: userId,
      toId: context.partnerId!,
      text: trimmed,
      sendAt,
    }),
  );
  return { ok: true };
}
