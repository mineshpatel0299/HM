"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getDb, withDbRetry } from "@/lib/db/client";
import { rituals } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import { bumpStreak } from "@/lib/milestones/bumpStreak";
import { hasLoggedToday, type RitualKind } from "./queries";

type LogResult =
  | { ok: true; alreadyLoggedToday: boolean; bothLogged: boolean; streakCount: number | null }
  | { ok: false; error: string };

const STREAK_LABEL: Record<RitualKind, string> = {
  goodnight: "goodnight streak",
  goodmorning: "good morning streak",
};

/**
 * "Same local calendar day" is evaluated per-person, in their own stored
 * timezone — not a shared UTC day. Each partner logs once during their own
 * day; if both have, for that same kind, on their own respective "today",
 * it counts as a match and the streak advances.
 */
export async function logRitual(coupleId: string, kind: RitualKind): Promise<LogResult> {
  const { userId } = await assertCoupleMember(coupleId);

  const context = await getCoupleContext();
  if (!context || context.coupleId !== coupleId || !context.partnerId || !context.partnerTimezone) {
    return { ok: false, error: "Your partner hasn't joined yet." };
  }

  const db = getDb();
  const alreadyLoggedToday = await hasLoggedToday(coupleId, userId, kind, context.myTimezone);

  if (!alreadyLoggedToday) {
    await withDbRetry(() => db.insert(rituals).values({ coupleId, kind, authorId: userId }));
  }

  const partnerAlsoLogged = await hasLoggedToday(
    coupleId,
    context.partnerId,
    kind,
    context.partnerTimezone,
  );

  let streakCount: number | null = null;
  if (partnerAlsoLogged) {
    streakCount = await bumpStreak(coupleId, STREAK_LABEL[kind]);
  }

  await triggerCoupleEvent(coupleId, "ritual:logged", {
    kind,
    authorId: userId,
    bothLogged: partnerAlsoLogged,
    streakCount,
  });

  return { ok: true, alreadyLoggedToday, bothLogged: partnerAlsoLogged, streakCount };
}
