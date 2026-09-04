import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { jarNotes } from "@/lib/db/schema";
import type { JarNote } from "./types";

export type JarState = { unopenedCount: number; recentlyOpened: JarNote[] };

export async function getJarState(coupleId: string): Promise<JarState> {
  const db = getDb();

  const [{ count }] = await withDbRetry(() =>
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(jarNotes)
      .where(and(eq(jarNotes.coupleId, coupleId), eq(jarNotes.opened, false))),
  );

  const opened = await withDbRetry(() =>
    db
      .select()
      .from(jarNotes)
      .where(and(eq(jarNotes.coupleId, coupleId), eq(jarNotes.opened, true)))
      .orderBy(desc(jarNotes.openedAt))
      .limit(5),
  );

  return {
    unopenedCount: count,
    recentlyOpened: opened.map((row) => ({
      id: row.id,
      coupleId: row.coupleId,
      authorId: row.authorId,
      text: row.text,
      opened: row.opened,
      openedAt: row.openedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}
