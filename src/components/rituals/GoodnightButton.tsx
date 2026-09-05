"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { nightSettle, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { logRitual } from "@/lib/rituals/actions";
import { Moon, Stars, Flame, Check } from "lucide-react";

type RitualEvent = {
  kind: "goodnight" | "goodmorning";
  authorId: string;
  bothLogged: boolean;
  streakCount: number | null;
};

export function GoodnightButton({
  coupleId,
  partnerName,
  initialLoggedToday,
}: {
  coupleId: string;
  partnerName: string;
  initialLoggedToday: boolean;
}) {
  const [loggedToday, setLoggedToday] = useState(initialLoggedToday);
  const [bothSaidGoodnight, setBothSaidGoodnight] = useState(false);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [showSettle, setShowSettle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { variants } = useReducedMotionSafe();

  function celebrate(count: number | null) {
    setBothSaidGoodnight(true);
    setStreakCount(count);
    setShowSettle(true);
    window.setTimeout(() => setShowSettle(false), 3200);
  }

  useRealtimeEvent<RitualEvent>("ritual:logged", (event) => {
    if (event.kind !== "goodnight" || !event.bothLogged) return;
    celebrate(event.streakCount);
  });

  async function handleTap() {
    if (loggedToday || isSaving) return;
    setIsSaving(true);
    const result = await logRitual(coupleId, "goodnight");
    setIsSaving(false);
    if (result.ok) {
      setLoggedToday(true);
      if (result.bothLogged) celebrate(result.streakCount);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass overflow-hidden relative">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-lilac flex items-center justify-center gap-1">
          <Stars className="h-3.5 w-3.5 text-lilac" />
          Evening Ritual
        </span>
        <h3 className="font-display text-xl font-bold text-ink">Goodnight Ritual</h3>
        <p className="font-sans text-xs text-ink-muted">
          Send a soft goodnight signal before you rest.
        </p>
      </div>

      <div className="relative flex h-24 w-24 items-center justify-center my-2">
        {showSettle && (
          <motion.span
            variants={variants(nightSettle)}
            initial="initial"
            animate="animate"
            className="absolute h-24 w-24 rounded-full bg-indigo-500/30 blur-md"
            aria-hidden="true"
          />
        )}
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          onClick={handleTap}
          disabled={loggedToday || isSaving}
          aria-label="Say goodnight"
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-all ${
            loggedToday
              ? "bg-slate-800/80 border border-slate-700 text-slate-300"
              : "bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 shadow-indigo-900/30 hover:scale-105"
          }`}
        >
          {loggedToday ? (
            <Check className="h-8 w-8 text-emerald-400" />
          ) : (
            <Moon className="h-8 w-8 text-indigo-200 fill-indigo-200/20 animate-pulse-slow" />
          )}
        </motion.button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-sans text-xs font-semibold text-ink">
          {bothSaidGoodnight
            ? `You both said goodnight tonight!`
            : loggedToday
              ? `You said goodnight — waiting on ${partnerName}`
              : "Tap moon to say goodnight"}
        </p>
        {streakCount && (
          <span className="flex items-center gap-1 text-[11px] font-sans font-bold text-amber bg-amber/10 px-3 py-1 rounded-full border border-amber/20">
            <Flame className="h-3.5 w-3.5 text-amber fill-amber animate-pulse" />
            {streakCount} Night Streak!
          </span>
        )}
      </div>
    </div>
  );
}
