"use server";

import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getDb, withDbRetry } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { getPublicUrl } from "@/lib/storage/r2";
import type { Photo } from "./types";

type AddPhotoResult = { ok: true; photo: Photo } | { ok: false; error: string };

/** Called after the file is already on R2 via useUpload — this just
 * records it. `r2Key` comes from useUpload's return value, not derived
 * from the public URL client-side. */
export async function addPhoto(
  coupleId: string,
  r2Key: string,
  caption: string | null,
  takenAt: string | null,
): Promise<AddPhotoResult> {
  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .insert(photos)
      .values({ coupleId, authorId: userId, r2Key, caption, takenAt })
      .returning(),
  );

  return {
    ok: true,
    photo: {
      id: row.id,
      coupleId: row.coupleId,
      authorId: row.authorId,
      publicUrl: getPublicUrl(row.r2Key),
      caption: row.caption,
      takenAt: row.takenAt,
      createdAt: row.createdAt.toISOString(),
    },
  };
}
