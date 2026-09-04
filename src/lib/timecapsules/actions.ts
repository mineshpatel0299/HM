"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { timeCapsules } from "@/lib/db/schema";

type CreateResult = { ok: true } | { ok: false; error: string };

// Deliberately no realtime broadcast here — a sealed capsule staying a
// quiet surprise until the partner next opens the list fits the feature
// better than announcing "a capsule was just sealed."
export async function createTimeCapsule(
  coupleId: string,
  content: string,
  r2Key: string | null,
  unlockAtIso: string,
): Promise<CreateResult> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };

  const unlockAt = new Date(unlockAtIso);
  if (Number.isNaN(unlockAt.getTime()) || unlockAt.getTime() <= Date.now()) {
    return { ok: false, error: "Pick a date in the future." };
  }

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  await withDbRetry(() =>
    db.insert(timeCapsules).values({ coupleId, authorId: userId, content: trimmed, r2Key, unlockAt }),
  );

  return { ok: true };
}
