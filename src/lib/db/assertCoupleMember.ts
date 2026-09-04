import "server-only";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb, withDbRetry } from "./client";
import { couples } from "./schema";

export class CoupleAccessError extends Error {}

/**
 * Neon has no RLS layer, so every server action / route touching
 * couple-scoped data must call this first with the coupleId it's about to
 * query — there's no other backstop against one user reading or writing
 * the other couple's rows.
 */
export async function assertCoupleMember(coupleId: string): Promise<{ userId: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new CoupleAccessError("Not signed in.");

  const db = getDb();
  const [couple] = await withDbRetry(() =>
    db
      .select({ partnerAId: couples.partnerAId, partnerBId: couples.partnerBId })
      .from(couples)
      .where(eq(couples.id, coupleId))
      .limit(1),
  );

  if (!couple || (couple.partnerAId !== userId && couple.partnerBId !== userId)) {
    throw new CoupleAccessError("Not a member of this couple.");
  }

  return { userId };
}
