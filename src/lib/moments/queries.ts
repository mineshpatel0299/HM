import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { moments } from "@/lib/db/schema";
import type { MomentEvent } from "./types";

export async function getRecentMoments(coupleId: string, limit = 20): Promise<MomentEvent[]> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(moments)
      .where(eq(moments.coupleId, coupleId))
      .orderBy(desc(moments.createdAt))
      .limit(limit),
  );
  return rows.map((row) => ({
    id: row.id,
    coupleId: row.coupleId,
    authorId: row.authorId,
    text: row.text,
    mood: row.mood,
    createdAt: row.createdAt.toISOString(),
  }));
}
