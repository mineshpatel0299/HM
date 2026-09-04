"use server";

import { randomBytes } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDb, withDbRetry } from "@/lib/db/client";
import { couples } from "@/lib/db/schema";

// No 0/O/1/I/L — a couple should be able to read this off one phone and
// type it into the other without ambiguity.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateInviteCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

type ActionResult = { ok: true } | { ok: false; error: string };
type CreateSpaceResult = { ok: true; inviteCode: string } | { ok: false; error: string };

async function requireUnpairedUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "You need to be signed in." };

  const db = getDb();
  const [existing] = await withDbRetry(() =>
    db
      .select({ id: couples.id })
      .from(couples)
      .where(or(eq(couples.partnerAId, userId), eq(couples.partnerBId, userId)))
      .limit(1),
  );
  if (existing) return { ok: false, error: "You're already part of a space." };

  return { ok: true, userId };
}

export async function createSpace(): Promise<CreateSpaceResult> {
  const check = await requireUnpairedUser();
  if (!check.ok) return check;

  const db = getDb();
  let code = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const [clash] = await withDbRetry(() =>
      db.select({ id: couples.id }).from(couples).where(eq(couples.inviteCode, code)).limit(1),
    );
    if (!clash) break;
    code = generateInviteCode();
  }

  await withDbRetry(() =>
    db.insert(couples).values({ inviteCode: code, partnerAId: check.userId }),
  );

  // Deliberately no revalidatePath here: getCoupleContext() would already
  // resolve truthy for this user (partnerAId is set), which would swap
  // Pairing out for the app home before they've had a chance to see and
  // send the invite code. The client shows the code first and refreshes
  // the route itself once the user dismisses that screen.
  return { ok: true, inviteCode: code };
}

export async function joinSpace(rawCode: string): Promise<ActionResult> {
  const check = await requireUnpairedUser();
  if (!check.ok) return check;

  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter the code your partner sent you." };

  const db = getDb();
  const [couple] = await withDbRetry(() =>
    db.select().from(couples).where(eq(couples.inviteCode, code)).limit(1),
  );

  if (!couple) return { ok: false, error: "That code doesn't match a space." };
  if (couple.partnerAId && couple.partnerBId) {
    return { ok: false, error: "That space is already full." };
  }

  if (couple.partnerAId) {
    await withDbRetry(() =>
      db.update(couples).set({ partnerBId: check.userId }).where(eq(couples.id, couple.id)),
    );
  } else {
    await withDbRetry(() =>
      db.update(couples).set({ partnerAId: check.userId }).where(eq(couples.id, couple.id)),
    );
  }

  revalidatePath("/");
  return { ok: true };
}
