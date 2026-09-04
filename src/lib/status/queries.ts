import "server-only";
import { eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { liveStatus } from "@/lib/db/schema";
import type { LiveStatusEvent } from "./types";

export async function getStatus(profileId: string): Promise<LiveStatusEvent | null> {
  const db = getDb();
  const [row] = await withDbRetry(() =>
    db.select().from(liveStatus).where(eq(liveStatus.profileId, profileId)).limit(1),
  );
  if (!row) return null;
  return {
    profileId: row.profileId,
    coupleId: row.coupleId,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}
