"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ripple, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { setMyStatus } from "@/lib/status/actions";
import type { LiveStatusEvent } from "@/lib/status/types";
import { Activity, Send, Check } from "lucide-react";

const QUICK_OPTIONS = ["Free to call 📞", "Sleeping 🌙", "At work 💼", "Traveling ✈️", "Thinking of you 💖"];
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
    <div className="flex flex-col gap-4 rounded-3xl glass-card p-5 border border-white/80 shadow-glass">
      {/* Partner Status Display Bar */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper2/80 px-4 py-3 border border-line">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            {fresh && (
              <motion.span
                variants={variants(ripple)}
                initial="initial"
                animate="animate"
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
              />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                fresh ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-ink/20"
              }`}
            />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ink-muted">
              {partnerName}&apos;s Live Status
            </span>
            <span className="font-sans text-sm font-semibold text-ink">
              {partnerStatus ? partnerStatus.status : `Hasn't set a status yet`}
            </span>
          </div>
        </div>

        {partnerStatus && (
          <span
            className="shrink-0 rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-sans font-medium text-ink-muted border border-line"
            suppressHydrationWarning
          >
            {relativeMinutes(partnerStatus.updatedAt)}
          </span>
        )}
      </div>

      {/* Quick Status Pill Chips */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-ember" />
            Update your status
          </span>
          {savedLabel && (
            <span className="text-xs font-sans font-medium text-emerald-700 flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Set to &ldquo;{savedLabel}&rdquo;
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
              className="rounded-xl border border-line bg-white/70 px-3.5 py-1.5 font-sans text-xs font-medium text-ink hover:bg-paper2 hover:border-ember/30 transition-all disabled:opacity-50 shadow-sm"
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Status Input */}
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
          placeholder="Or write custom status..."
          aria-label="custom status"
          className="flex-1 rounded-2xl glass-input px-4 py-2 font-sans text-xs text-ink placeholder:text-ink-muted outline-none"
        />
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="submit"
          disabled={isSaving || !customText.trim()}
          className="rounded-2xl gradient-btn px-4 py-2 font-sans text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>Share</span>
          <Send className="h-3 w-3" />
        </motion.button>
      </form>
    </div>
  );
}
