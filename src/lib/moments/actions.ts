"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { moments } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import type { MomentEvent } from "./types";

type PostResult = { ok: true; moment: MomentEvent } | { ok: false; error: string };

export async function postMoment(
  coupleId: string,
  text: string,
  mood: string | null,
): Promise<PostResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db.insert(moments).values({ coupleId, authorId: userId, text: trimmed, mood }).returning(),
  );

  const event: MomentEvent = {
    id: row.id,
    coupleId: row.coupleId,
    authorId: row.authorId,
    text: row.text,
    mood: row.mood,
    createdAt: row.createdAt.toISOString(),
  };

  await triggerCoupleEvent(coupleId, "moment:posted", event);
  return { ok: true, moment: event };
}
