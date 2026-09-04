"use server";

import { and, eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getDb, withDbRetry } from "@/lib/db/client";
import { jarNotes } from "@/lib/db/schema";
import type { JarNote } from "./types";

type DropResult = { ok: true } | { ok: false; error: string };

export async function dropNote(coupleId: string, text: string): Promise<DropResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };

  const { userId } = await assertCoupleMember(coupleId);
  const db = getDb();
  await withDbRetry(() => db.insert(jarNotes).values({ coupleId, authorId: userId, text: trimmed }));
  return { ok: true };
}

type OpenResult = { ok: true; note: JarNote } | { ok: false; error: string };

// A note written for you is the point of the jar — bias the pick toward
// the partner's notes rather than a flat random draw across both.
const PARTNER_BIAS = 0.75;

export async function openRandomNote(coupleId: string): Promise<OpenResult> {
  const { userId } = await assertCoupleMember(coupleId);
  const context = await getCoupleContext();
  if (!context || context.coupleId !== coupleId || !context.partnerId) {
    return { ok: false, error: "Your partner hasn't joined yet." };
  }

  const db = getDb();
  const unopened = await withDbRetry(() =>
    db.select().from(jarNotes).where(and(eq(jarNotes.coupleId, coupleId), eq(jarNotes.opened, false))),
  );
  if (unopened.length === 0) return { ok: false, error: "The jar is empty." };

  const partnerNotes = unopened.filter((note) => note.authorId === context.partnerId);
  const myNotes = unopened.filter((note) => note.authorId === userId);

  let pool = partnerNotes.length > 0 ? partnerNotes : myNotes;
  if (partnerNotes.length > 0 && myNotes.length > 0 && Math.random() > PARTNER_BIAS) {
    pool = myNotes;
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const [opened] = await withDbRetry(() =>
    db
      .update(jarNotes)
      .set({ opened: true, openedAt: new Date() })
      .where(and(eq(jarNotes.id, chosen.id), eq(jarNotes.opened, false)))
      .returning(),
  );
  if (!opened) return { ok: false, error: "Someone else just opened that one — try again." };

  return {
    ok: true,
    note: {
      id: opened.id,
      coupleId: opened.coupleId,
      authorId: opened.authorId,
      text: opened.text,
      opened: opened.opened,
      openedAt: opened.openedAt?.toISOString() ?? null,
      createdAt: opened.createdAt.toISOString(),
    },
  };
}
