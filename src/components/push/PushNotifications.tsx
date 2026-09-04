"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push/actions";
import type { PushSubscriptionJSON } from "@/lib/push/types";

// The DOM lib's own PushSubscriptionJSON types `keys` as an optional generic
// record; a real subscription always has endpoint + p256dh/auth, so this
// narrows rather than bypasses the check `as any` would.
function toSubscriptionJSON(subscription: PushSubscription): PushSubscriptionJSON {
  const json = subscription.toJSON();
  return { endpoint: json.endpoint!, keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth } };
}

type Status = "unsupported" | "checking" | "off" | "denied" | "on" | "working";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  return Uint8Array.from(raw.split("").map((char) => char.charCodeAt(0)));
}

export function PushNotifications() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, []);

  async function handleEnable() {
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
      });

      const result = await subscribeToPush(toSubscriptionJSON(subscription));
      setStatus(result.ok ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }

  async function handleDisable() {
    setStatus("working");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setStatus("on");
    }
  }

  if (status === "unsupported" || status === "checking") return null;

  if (status === "denied") {
    return (
      <p className="font-sans text-xs text-ink/70">
        notifications are blocked in your browser settings — turn them on there to hear pings and
        notes when the app is closed.
      </p>
    );
  }

  if (status === "on") {
    return (
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleDisable}
        className="self-start font-sans text-xs text-ink/70 underline underline-offset-4"
      >
        notifications are on
      </motion.button>
    );
  }

  return (
    <motion.button
      variants={scalePress}
      initial="rest"
      whileTap="tap"
      type="button"
      onClick={handleEnable}
      disabled={status === "working"}
      className="self-start rounded-full border border-line px-3 py-1.5 font-sans text-xs text-ink disabled:opacity-50"
    >
      {status === "working" ? "turning on…" : "turn on notifications"}
    </motion.button>
  );
}
