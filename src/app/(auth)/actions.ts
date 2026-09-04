"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { signIn } from "@/auth";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function signup(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  if (!email || !password || !displayName || !timezone) {
    return { ok: false, error: "Fill in every field." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password needs to be at least 8 characters." };
  }

  const db = getDb();
  const [existing] = await withDbRetry(() =>
    db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1),
  );
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const passwordHash = await hash(password, 12);
  await withDbRetry(() =>
    db.insert(profiles).values({ email, passwordHash, displayName, timezone }),
  );

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return {
      ok: false,
      error: "Account created, but signing you in failed — try logging in.",
    };
  }

  return { ok: true };
}
