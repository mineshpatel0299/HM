import "server-only";
import { and, desc, eq, lte } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { scheduledNotes } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import { sendPushToProfile } from "@/lib/push/send";
import type { ScheduledNote } from "./types";

function toNote(row: typeof scheduledNotes.$inferSelect): ScheduledNote {
  return {
    id: row.id,
    coupleId: row.coupleId,
    authorId: row.authorId,
    toId: row.toId,
    text: row.text,
    sendAt: row.sendAt.toISOString(),
    sent: row.sent,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * No cron: flips due notes right here, same pattern as time capsules —
 * except this one also broadcasts each newly-sent note the moment it
 * flips, so it can arrive as a live toast if the recipient happens to be
 * online right now. Either partner's page load can trigger the flip (the
 * check isn't scoped to the recipient), matching the brief's own
 * "appears next time either of you loads the app" framing.
 */
export async function getMyScheduledNotes(coupleId: string, myId: string): Promise<ScheduledNote[]> {
  const db = getDb();

  const justSent = await withDbRetry(() =>
    db
      .update(scheduledNotes)
      .set({ sent: true })
      .where(
        and(
          eq(scheduledNotes.coupleId, coupleId),
          eq(scheduledNotes.sent, false),
          lte(scheduledNotes.sendAt, new Date()),
        ),
      )
      .returning(),
  );

  for (const row of justSent) {
    await triggerCoupleEvent(coupleId, "note:delivered", toNote(row));
    await sendPushToProfile(row.toId, {
      title: "a note just arrived",
      body: row.text.length > 120 ? `${row.text.slice(0, 117)}...` : row.text,
      url: "/notes",
    });
  }

  const rows = await withDbRetry(() =>
    db
      .select()
      .from(scheduledNotes)
      .where(
        and(eq(scheduledNotes.coupleId, coupleId), eq(scheduledNotes.toId, myId), eq(scheduledNotes.sent, true)),
      )
      .orderBy(desc(scheduledNotes.sendAt)),
  );

  return rows.map(toNote);
}
