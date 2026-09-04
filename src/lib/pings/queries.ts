import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { pings } from "@/lib/db/schema";
import type { PingEvent, PingKind, PingPayload } from "./types";

/** Last `limit` signals addressed to `userId` — an inbox, not a sent log. */
export async function getRecentPingsForUser(
  coupleId: string,
  userId: string,
  limit = 6,
): Promise<PingEvent[]> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(pings)
      .where(and(eq(pings.coupleId, coupleId), eq(pings.toId, userId)))
      .orderBy(desc(pings.createdAt))
      .limit(limit),
  );

  return rows.map((row) => ({
    id: row.id,
    coupleId: row.coupleId,
    fromId: row.fromId,
    toId: row.toId,
    kind: row.kind as PingKind,
    payload: row.payload as PingPayload,
    createdAt: row.createdAt.toISOString(),
  }));
}
