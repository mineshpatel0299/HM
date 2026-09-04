"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ripple, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { setMyStatus } from "@/lib/status/actions";
import type { LiveStatusEvent } from "@/lib/status/types";

const QUICK_OPTIONS = ["free to call", "sleeping", "at work", "traveling"];
const STALE_AFTER_MS = 10 * 60 * 1000;

function isFresh(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() < STALE_AFTER_MS;
}

function relativeMinutes(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1m ago";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export function LiveStatusPill({
  coupleId,
  myId,
  partnerName,
  initialPartnerStatus,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  initialPartnerStatus: LiveStatusEvent | null;
}) {
  const [partnerStatus, setPartnerStatus] = useState(initialPartnerStatus);
  const [customText, setCustomText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const { variants } = useReducedMotionSafe();

  useRealtimeEvent<LiveStatusEvent>("status:updated", (event) => {
    if (event.coupleId !== coupleId || event.profileId === myId) return;
    setPartnerStatus(event);
  });

  // Keeps the "Xm ago" label honest without a refetch.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  async function handleSetStatus(status: string) {
    setIsSaving(true);
    const result = await setMyStatus(coupleId, status);
    setIsSaving(false);
    if (result.ok) {
      setSavedLabel(status);
      setCustomText("");
      window.setTimeout(() => setSavedLabel(null), 2500);
    }
  }

  const fresh = partnerStatus ? isFresh(partnerStatus.updatedAt) : false;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-line bg-paper2 px-4 py-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {fresh && (
            <motion.span
              variants={variants(ripple)}
              initial="initial"
              animate="animate"
              className="absolute inline-flex h-full w-full rounded-full bg-sage"
            />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${fresh ? "bg-sage" : "bg-ink/20"}`}
          />
        </span>
        <span className="font-sans text-sm text-ink">
          {partnerStatus ? partnerStatus.status : `${partnerName} hasn't set a status`}
        </span>
        {partnerStatus && (
          // suppressHydrationWarning: time-relative text legitimately
          // differs by a second or two between server render and client
          // hydration.
          <span
            className="ml-auto shrink-0 font-sans text-xs text-ink/70"
            suppressHydrationWarning
          >
            {relativeMinutes(partnerStatus.updatedAt)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => (
          <motion.button
            key={option}
            variants={scalePress}
            initial="rest"
            whileTap="tap"
            onClick={() => handleSetStatus(option)}
            disabled={isSaving}
            className="rounded-full border border-line px-3 py-1.5 font-sans text-xs text-ink disabled:opacity-50"
          >
            {option}
          </motion.button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (customText.trim()) handleSetStatus(customText.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={customText}
          onChange={(event) => setCustomText(event.target.value)}
          placeholder="or write your own"
          aria-label="custom status"
          className="flex-1 rounded-full border border-line bg-paper px-3 py-1.5 font-sans text-xs text-ink outline-none focus:border-ember"
        />
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="submit"
          disabled={isSaving || !customText.trim()}
          className="rounded-full bg-emberDark px-3 py-1.5 font-sans text-xs text-paper disabled:opacity-50"
        >
          set
        </motion.button>
      </form>

      {savedLabel && (
        <p className="font-sans text-xs text-ink">you&apos;re set to &ldquo;{savedLabel}&rdquo;</p>
      )}
    </div>
  );
}
