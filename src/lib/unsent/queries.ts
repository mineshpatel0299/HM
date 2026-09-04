import "server-only";
import { and, desc, eq, inArray, lte } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { unsentMessages } from "@/lib/db/schema";
import type { UnsentMessage } from "./types";

function toMessage(row: typeof unsentMessages.$inferSelect): UnsentMessage {
  return {
    id: row.id,
    coupleId: row.coupleId,
    authorId: row.authorId,
    text: row.text,
    visibility: row.visibility,
    unlockAt: row.unlockAt?.toISOString() ?? null,
    revealed: row.revealed,
    createdAt: row.createdAt.toISOString(),
  };
}

export type UnsentVaultState = { mine: UnsentMessage[]; fromPartner: UnsentMessage[] };

/**
 * The author always sees all of their own entries in full, regardless of
 * visibility. The partner only ever sees entries that are BOTH non-private
 * AND already revealed — that filter lives in the WHERE clause itself, not
 * as a post-fetch check, so an unrevealed or private entry is never even
 * selected for the partner's side of the response.
 */
export async function getUnsentVaultState(
  coupleId: string,
  myId: string,
  partnerId: string,
): Promise<UnsentVaultState> {
  const db = getDb();

  // Flip any unlock_on_date entries (from either partner) whose date has
  // passed — same no-cron pattern as time capsules.
  await withDbRetry(() =>
    db
      .update(unsentMessages)
      .set({ revealed: true })
      .where(
        and(
          eq(unsentMessages.coupleId, coupleId),
          eq(unsentMessages.visibility, "unlock_on_date"),
          eq(unsentMessages.revealed, false),
          lte(unsentMessages.unlockAt, new Date()),
        ),
      ),
  );

  const mineRows = await withDbRetry(() =>
    db
      .select()
      .from(unsentMessages)
      .where(and(eq(unsentMessages.coupleId, coupleId), eq(unsentMessages.authorId, myId)))
      .orderBy(desc(unsentMessages.createdAt)),
  );

  const partnerRows = await withDbRetry(() =>
    db
      .select()
      .from(unsentMessages)
      .where(
        and(
          eq(unsentMessages.coupleId, coupleId),
          eq(unsentMessages.authorId, partnerId),
          eq(unsentMessages.revealed, true),
          inArray(unsentMessages.visibility, ["unlock_on_date", "unlock_on_read_request"]),
        ),
      )
      .orderBy(desc(unsentMessages.createdAt)),
  );

  return { mine: mineRows.map(toMessage), fromPartner: partnerRows.map(toMessage) };
}
