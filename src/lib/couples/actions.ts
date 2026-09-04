"use server";

import { eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { couples } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";

export type CoupleDateField = "sinceDate" | "nextVisitDate";
export type CoupleDatesUpdatedEvent = { field: CoupleDateField; value: string | null };

type UpdateResult = { ok: true } | { ok: false; error: string };

/** Broadcasts so both partners' StatCards update live, not just the editor's own. */
export async function updateCoupleDate(
  coupleId: string,
  field: CoupleDateField,
  value: string | null,
): Promise<UpdateResult> {
  await assertCoupleMember(coupleId);

  const db = getDb();
  await withDbRetry(() =>
    db
      .update(couples)
      .set(field === "sinceDate" ? { sinceDate: value } : { nextVisitDate: value })
      .where(eq(couples.id, coupleId)),
  );

  const event: CoupleDatesUpdatedEvent = { field, value };
  await triggerCoupleEvent(coupleId, "couple:datesUpdated", event);
  return { ok: true };
}
