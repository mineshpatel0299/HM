import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { getPublicUrl } from "@/lib/storage/r2";
import type { Photo } from "./types";

export async function getPhotos(coupleId: string, limit = 60): Promise<Photo[]> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(photos)
      .where(eq(photos.coupleId, coupleId))
      .orderBy(desc(photos.createdAt))
      .limit(limit),
  );
  return rows.map((row) => ({
    id: row.id,
    coupleId: row.coupleId,
    authorId: row.authorId,
    publicUrl: getPublicUrl(row.r2Key),
    caption: row.caption,
    takenAt: row.takenAt,
    createdAt: row.createdAt.toISOString(),
  }));
}
