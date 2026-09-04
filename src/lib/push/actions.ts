"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb, withDbRetry } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import type { PushSubscriptionJSON } from "./types";

type PushActionResult = { ok: true } | { ok: false; error: string };

export async function subscribeToPush(subscription: PushSubscriptionJSON): Promise<PushActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Not signed in." };

  const db = getDb();
  await withDbRetry(() =>
    db
      .insert(pushSubscriptions)
      .values({
        profileId: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        // Re-subscribing (e.g. after a key rotation) can hand back the same
        // endpoint with new keys, or the same device signing in as the
        // other partner after a sign-out — either way the row should
        // reflect who owns it now.
        set: {
          profileId: userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }),
  );

  return { ok: true };
}

export async function unsubscribeFromPush(endpoint: string): Promise<PushActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const db = getDb();
  await withDbRetry(() => db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)));

  return { ok: true };
}
