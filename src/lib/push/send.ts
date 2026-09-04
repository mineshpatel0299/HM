import "server-only";
import webpush from "web-push";
import { eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import type { PushPayload } from "./types";

let configured = false;

function isConfigured(): boolean {
  if (configured) return true;
  const { VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_SUBJECT || !NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

/**
 * Best-effort: a push failing (expired subscription, VAPID not configured
 * yet in this environment) must never break the ping/note send it's
 * attached to, so every failure path here swallows and logs instead of
 * throwing.
 */
export async function sendPushToProfile(profileId: string, payload: PushPayload): Promise<void> {
  if (!isConfigured()) return;

  const db = getDb();
  const subs = await withDbRetry(() =>
    db.select().from(pushSubscriptions).where(eq(pushSubscriptions.profileId, profileId)),
  );

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription is dead (browser unsubscribed, uninstalled the
          // app, etc.) — clean it up rather than retrying it forever.
          await withDbRetry(() =>
            db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint)),
          );
        } else {
          console.error("push send failed", error);
        }
      }
    }),
  );
}
