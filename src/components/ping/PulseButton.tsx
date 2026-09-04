"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ripple, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { sendPing } from "@/lib/pings/actions";

export function PulseButton({ coupleId }: { coupleId: string }) {
  const [isSending, setIsSending] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { variants } = useReducedMotionSafe();

  async function handlePress() {
    if (isSending) return;
    setError(null);
    setIsSending(true);
    setShowRipple(true);

    const result = await sendPing(coupleId, "ping");
    setIsSending(false);
    if (!result.ok) setError(result.error);

    window.setTimeout(() => setShowRipple(false), 1600);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {showRipple && (
          <motion.span
            variants={variants(ripple)}
            initial="initial"
            animate="animate"
            className="absolute h-16 w-16 rounded-full bg-ember/40"
            aria-hidden="true"
          />
        )}
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          onClick={handlePress}
          disabled={isSending}
          aria-label="send a ping"
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-emberDark font-display text-2xl text-paper shadow-sm disabled:opacity-70"
        >
          ♥
        </motion.button>
      </div>
      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}
    </div>
  );
}
