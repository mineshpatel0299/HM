import "server-only";
import { cache } from "react";
import { eq, inArray, or } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb, withDbRetry } from "./client";
import { couples, profiles } from "./schema";

export type CoupleContext = {
  coupleId: string;
  inviteCode: string;
  myId: string;
  partnerId: string | null;
  myName: string;
  partnerName: string | null;
  myTimezone: string;
  partnerTimezone: string | null;
  sinceDate: string | null;
  nextVisitDate: string | null;
};

/**
 * Shared context every later phase's server components/actions read from.
 * Returns null when there's no signed-in user or they haven't paired yet.
 * Wrapped in React's cache() since both the (app) layout (for
 * RealtimeProvider) and individual pages call this within the same request.
 */
export const getCoupleContext = cache(async (): Promise<CoupleContext | null> => {
  const session = await auth();
  const myId = session?.user?.id;
  if (!myId) return null;

  const db = getDb();
  const [couple] = await withDbRetry(() =>
    db
      .select()
      .from(couples)
      .where(or(eq(couples.partnerAId, myId), eq(couples.partnerBId, myId)))
      .limit(1),
  );
  if (!couple) return null;

  const partnerId = couple.partnerAId === myId ? couple.partnerBId : couple.partnerAId;

  const participantIds = [myId, partnerId].filter((id): id is string => Boolean(id));
  const rows = await withDbRetry(() =>
    db.select().from(profiles).where(inArray(profiles.id, participantIds)),
  );

  const me = rows.find((row) => row.id === myId);
  const partner = partnerId ? rows.find((row) => row.id === partnerId) : undefined;
  if (!me) return null;

  return {
    coupleId: couple.id,
    inviteCode: couple.inviteCode,
    myId,
    partnerId: partnerId ?? null,
    myName: me.displayName,
    partnerName: partner?.displayName ?? null,
    myTimezone: me.timezone,
    partnerTimezone: partner?.timezone ?? null,
    sinceDate: couple.sinceDate,
    nextVisitDate: couple.nextVisitDate,
  };
});
