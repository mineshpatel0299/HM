"use server";

import { eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { unsentMessages } from "@/lib/db/schema";
import type { UnsentVisibility } from "./types";

type WriteResult = { ok: true } | { ok: false; error: string };

export async function writeUnsentMessage(
  coupleId: string,
  text: string,
  visibility: UnsentVisibility,
  unlockAt: string | null,
): Promise<WriteResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };
  if (visibility === "unlock_on_date" && !unlockAt) {
    return { ok: false, error: "Pick an unlock date." };
  }

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  await withDbRetry(() =>
    db.insert(unsentMessages).values({
      coupleId,
      authorId: userId,
      text: trimmed,
      visibility,
      unlockAt: visibility === "unlock_on_date" && unlockAt ? new Date(unlockAt) : null,
    }),
  );
  return { ok: true };
}

type RevealResult = { ok: true } | { ok: false; error: string };

/** Only the author can trigger this — it's their call to share, and only
 * for entries they wrote as revealable in the first place. */
export async function revealNow(coupleId: string, messageId: string): Promise<RevealResult> {
  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [existing] = await withDbRetry(() =>
    db.select().from(unsentMessages).where(eq(unsentMessages.id, messageId)).limit(1),
  );
  if (!existing || existing.coupleId !== coupleId) {
    return { ok: false, error: "That entry doesn't exist." };
  }
  if (existing.authorId !== userId) {
    return { ok: false, error: "Only the author can share this." };
  }
  if (existing.visibility === "private") {
    return { ok: false, error: "This entry was written to stay private." };
  }

  await withDbRetry(() =>
    db.update(unsentMessages).set({ revealed: true }).where(eq(unsentMessages.id, messageId)),
  );
  return { ok: true };
}
