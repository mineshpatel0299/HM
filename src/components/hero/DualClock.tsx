"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";
import { springSlow, useReducedMotionSafe } from "@/lib/motion";

function isDaytime(date: Date, timeZone: string): boolean {
  const hour = Number(formatInTimeZone(date, timeZone, "H"));
  return hour >= 6 && hour < 18;
}

// 1 (rough day) through 5 (great day) — reusing existing theme tokens, no
// new colors introduced for this.
const MOOD_DOT_COLOR: Record<number, string> = {
  1: "bg-emberDark",
  2: "bg-ember",
  3: "bg-amber",
  4: "bg-lilac",
  5: "bg-sage",
};

function SkyBadge({
  label,
  timezone,
  moodScore,
}: {
  label: string;
  timezone: string;
  moodScore?: number | null;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const { transition } = useReducedMotionSafe();

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    // Avoids a server/client render mismatch — the server has no notion of
    // "now" for a specific timezone until this mounts client-side.
    return <div className="h-28 w-28 rounded-full bg-paper2" aria-hidden="true" />;
  }

  const day = isDaytime(now, timezone);
  const time = formatInTimeZone(now, timezone, "h:mm a");

  return (
    // Outer wrapper is NOT overflow-hidden — a circular clip-mask cuts away
    // exactly the corner area where a status dot would go (a circle never
    // reaches the corners of its bounding square), so the dot has to live
    // outside the clipped inner circle, not inside it.
    <div className="relative h-28 w-28 shrink-0">
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-center">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-amber to-paper"
          animate={{ opacity: day ? 1 : 0 }}
          transition={transition(springSlow)}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-ink to-lilac"
          animate={{ opacity: day ? 0 : 1 }}
          transition={transition(springSlow)}
        />
        <div className="relative flex flex-col items-center gap-0.5">
          <span className="text-xl" aria-hidden="true">
            {day ? "☀️" : "🌙"}
          </span>
          <span className={`font-display text-lg ${day ? "text-ink" : "text-paper"}`}>{time}</span>
          <span className={`font-sans text-xs ${day ? "text-ink/70" : "text-paper/70"}`}>{label}</span>
        </div>
      </div>
      {moodScore != null && (
        <span
          className={`absolute bottom-1 right-1 h-3 w-3 rounded-full ring-2 ring-paper ${MOOD_DOT_COLOR[moodScore]}`}
          aria-hidden="true"
        />
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
  /** Subtle indicator only — not shown for staleness, just today's mood. */
  partnerMoodScore?: number | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <SkyBadge label={myName} timezone={myTimezone} />
      <SkyBadge label={partnerName} timezone={partnerTimezone} moodScore={partnerMoodScore} />
    </div>
  );
}
