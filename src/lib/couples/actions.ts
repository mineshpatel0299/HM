"use server";

import { eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { couples } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import { revalidatePath } from "next/cache";

export type CoupleDateField = "sinceDate" | "nextVisitDate";
export type CoupleDatesUpdatedEvent = { field: CoupleDateField; value: string | null };

type UpdateResult = { ok: true } | { ok: false; error: string };

/** Broadcasts so both partners' StatCards update live, and revalidates server pages. */
export async function updateCoupleDate(
  coupleId: string,
  field: CoupleDateField,
  value: string | null,
): Promise<UpdateResult> {
  try {
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

    revalidatePath("/");
    revalidatePath("/memories");

    return { ok: true };
  } catch (error) {
    console.error("Error in updateCoupleDate:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update date" };
  }
}
