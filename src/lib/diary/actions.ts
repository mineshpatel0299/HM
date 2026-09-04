"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { diaryEntries } from "@/lib/db/schema";
import { triggerCoupleEvent } from "@/lib/realtime/pusherServer";
import type { MutualEntry } from "@/lib/reveal/useMutualReveal";

type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitDiaryEntry(
  coupleId: string,
  entryDate: string,
  entry: string,
): Promise<SubmitResult> {
  const trimmed = entry.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };

  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .insert(diaryEntries)
      .values({ coupleId, entryDate, authorId: userId, entry: trimmed })
      .onConflictDoNothing({
        target: [diaryEntries.coupleId, diaryEntries.entryDate, diaryEntries.authorId],
      })
      .returning(),
  );
  if (!row) return { ok: true };

  const event: MutualEntry = { authorId: userId, key: entryDate, text: trimmed };
  await triggerCoupleEvent(coupleId, "diary:submitted", event);
  return { ok: true };
}
