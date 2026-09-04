"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { nightSettle, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { logRitual } from "@/lib/rituals/actions";

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
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {showSettle && (
          <motion.span
            variants={variants(nightSettle)}
            initial="initial"
            animate="animate"
            className="absolute h-16 w-16 rounded-full bg-lilac/50"
            aria-hidden="true"
          />
        )}
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          onClick={handleTap}
          disabled={loggedToday || isSaving}
          aria-label="say goodnight"
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-2xl text-paper disabled:opacity-70"
        >
          🌙
        </motion.button>
      </div>
      <p className="max-w-[12rem] text-center font-sans text-xs text-ink/70">
        {bothSaidGoodnight
          ? `you both said goodnight tonight${streakCount ? ` — ${streakCount} night streak` : ""}`
          : loggedToday
            ? `you said goodnight — waiting on ${partnerName}`
            : "say goodnight"}
      </p>
    </div>
  );
}
