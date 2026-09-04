"use server";

import { and, desc, eq } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getDb, withDbRetry } from "@/lib/db/client";
import { moodCheckins } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";

type SubmitResult = { ok: true } | { ok: false; error: string };

/** One check-in per day per person — same-day resubmission updates the
 * existing row (people change their mind) rather than being rejected. */
export async function submitMoodCheckin(
  coupleId: string,
  moodScore: number,
  note: string | null,
): Promise<SubmitResult> {
  if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
    return { ok: false, error: "Invalid mood score." };
  }

  const { userId } = await assertCoupleMember(coupleId);
  const context = await getCoupleContext();
  if (!context || context.coupleId !== coupleId) {
    return { ok: false, error: "Not paired." };
  }

  const db = getDb();
  const [existing] = await withDbRetry(() =>
    db
      .select()
      .from(moodCheckins)
      .where(and(eq(moodCheckins.coupleId, coupleId), eq(moodCheckins.authorId, userId)))
      .orderBy(desc(moodCheckins.createdAt))
      .limit(1),
  );

  const todayKey = formatInTimeZone(new Date(), context.myTimezone, "yyyy-MM-dd");
  const isToday =
    existing && formatInTimeZone(existing.createdAt, context.myTimezone, "yyyy-MM-dd") === todayKey;

  if (isToday) {
    await withDbRetry(() =>
      db.update(moodCheckins).set({ moodScore, note }).where(eq(moodCheckins.id, existing.id)),
    );
  } else {
    await withDbRetry(() =>
      db.insert(moodCheckins).values({ coupleId, authorId: userId, moodScore, note }),
    );
  }

  await triggerCoupleEvent(coupleId, "mood:checkedin", { authorId: userId, moodScore });
  return { ok: true };
}
