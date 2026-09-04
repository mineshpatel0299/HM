import "server-only";
import { eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { truthLadderProgress } from "@/lib/db/schema";

export type LadderProgress = { currentLevel: number; ackedBy: string[] };

export async function getLadderProgress(coupleId: string): Promise<LadderProgress> {
  const db = getDb();
  const [row] = await withDbRetry(() =>
    db.select().from(truthLadderProgress).where(eq(truthLadderProgress.coupleId, coupleId)).limit(1),
  );
  if (!row) return { currentLevel: 1, ackedBy: [] };
  return { currentLevel: row.currentLevel, ackedBy: row.ackedBy };
}
