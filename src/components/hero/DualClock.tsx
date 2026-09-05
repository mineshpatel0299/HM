"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";
import { springSlow, useReducedMotionSafe } from "@/lib/motion";
import { Sun, Moon, Clock } from "lucide-react";

function isDaytime(date: Date, timeZone: string): boolean {
  const hour = Number(formatInTimeZone(date, timeZone, "H"));
  return hour >= 6 && hour < 18;
}

const MOOD_DOT_COLOR: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: "bg-rose-600", border: "border-rose-400", label: "Rough day" },
  2: { bg: "bg-amber-500", border: "border-amber-300", label: "Tired" },
  3: { bg: "bg-blue-400", border: "border-blue-300", label: "Okay" },
  4: { bg: "bg-emerald-400", border: "border-emerald-300", label: "Good" },
  5: { bg: "bg-pink-400", border: "border-pink-300", label: "Radiant" },
};

function getTimeDifference(tz1: string, tz2: string): string {
  const now = new Date();
  const dateStr1 = formatInTimeZone(now, tz1, "yyyy-MM-dd HH:mm");
  const dateStr2 = formatInTimeZone(now, tz2, "yyyy-MM-dd HH:mm");
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  const diffHours = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
  const rounded = Math.round(diffHours * 10) / 10;
  if (rounded === 0) return "Same timezone";
  if (rounded > 0) return `${rounded}h ahead`;
  return `${Math.abs(rounded)}h behind`;
}

function SkyBadge({
  label,
  timezone,
  moodScore,
  isPartner = false,
}: {
  label: string;
  timezone: string;
  moodScore?: number | null;
  isPartner?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const { transition } = useReducedMotionSafe();

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="flex flex-col items-center justify-center h-32 w-32 rounded-3xl bg-paper2/50 animate-pulse border border-line" />
    );
  }

  const day = isDaytime(now, timezone);
  const time = formatInTimeZone(now, timezone, "h:mm");
  const ampm = formatInTimeZone(now, timezone, "a");

  return (
    <div className="relative flex flex-col items-center justify-center h-32 w-32 rounded-3xl p-3 text-center transition-transform hover:scale-[1.02] shadow-glass border border-white/80 overflow-hidden group">
      {/* Dynamic Background Gradients */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-amber/20 via-orange-100/40 to-paper"
        animate={{ opacity: day ? 1 : 0 }}
        transition={transition(springSlow)}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white"
        animate={{ opacity: day ? 0 : 1 }}
        transition={transition(springSlow)}
      />

      {/* Decorative Sky Glow */}
      <div
        className={`absolute -top-6 -right-6 h-16 w-16 rounded-full blur-xl ${
          day ? "bg-amber-400/30" : "bg-indigo-400/30"
        }`}
      />

      <div className="relative z-10 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          {day ? (
            <Sun className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
          ) : (
            <Moon className="h-4 w-4 text-indigo-300" />
          )}
          <span className={`text-[10px] font-sans font-bold uppercase tracking-wider ${day ? "text-ink-muted" : "text-slate-300"}`}>
            {isPartner ? "Partner" : "You"}
          </span>
        </div>

        <div className="flex items-baseline gap-0.5">
          <span className={`font-display text-2xl font-bold tracking-tight ${day ? "text-ink" : "text-white"}`}>
            {time}
          </span>
          <span className={`text-[10px] font-sans font-semibold uppercase ${day ? "text-ink-muted" : "text-slate-400"}`}>
            {ampm}
          </span>
        </div>

        <span className={`font-sans text-xs font-medium truncate max-w-[100px] ${day ? "text-ink/80" : "text-slate-200"}`}>
          {label}
        </span>
      </div>

      {/* Mood Badge Dot for Partner */}
      {moodScore != null && MOOD_DOT_COLOR[moodScore] && (
        <div
          className="absolute top-2.5 right-2.5 flex items-center justify-center"
          title={`Mood: ${MOOD_DOT_COLOR[moodScore].label}`}
        >
          <span className={`h-3 w-3 rounded-full border-2 ${MOOD_DOT_COLOR[moodScore].bg} ${MOOD_DOT_COLOR[moodScore].border} shadow-sm animate-pulse`} />
        </div>
      )}
    </div>
  );
}

export function DualClock({
  myName,
  myTimezone,
  partnerName,
  partnerTimezone,
  partnerMoodScore,
}: {
  myName: string;
  myTimezone: string;
  partnerName: string;
  partnerTimezone: string;
  partnerMoodScore?: number | null;
}) {
  const diffStr = getTimeDifference(myTimezone, partnerTimezone);

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      <div className="flex items-center gap-3">
        <SkyBadge label={myName} timezone={myTimezone} />
        <SkyBadge label={partnerName} timezone={partnerTimezone} moodScore={partnerMoodScore} isPartner />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper2/80 border border-line text-[11px] font-sans font-medium text-ink-muted">
        <Clock className="h-3 w-3 text-ember" />
        <span>{diffStr}</span>
      </div>
    </div>
  );
}
