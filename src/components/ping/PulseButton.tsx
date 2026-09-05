"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ripple, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { sendPing } from "@/lib/pings/actions";
import { Heart } from "lucide-react";

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
    <div className="flex flex-col items-center gap-4 rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ember">
          Instant Pulse
        </span>
        <h3 className="font-display text-xl font-bold text-ink">Send a Nudge</h3>
        <p className="font-sans text-xs text-ink-muted">
          Tap the heart to let your partner feel your presence right now.
        </p>
      </div>

      <div className="relative flex h-24 w-24 items-center justify-center my-2">
        {showRipple && (
          <motion.span
            variants={variants(ripple)}
            initial="initial"
            animate="animate"
            className="absolute h-24 w-24 rounded-full bg-gradient-to-tr from-ember/40 to-amber/40 shadow-glow"
            aria-hidden="true"
          />
        )}
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          onClick={handlePress}
          disabled={isSending}
          aria-label="Send a instant ping"
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full gradient-btn text-white shadow-xl shadow-ember/30 disabled:opacity-70 group"
        >
          <Heart className="h-9 w-9 fill-white/30 group-hover:scale-110 transition-transform duration-300 animate-heartbeat" />
        </motion.button>
      </div>

      {error && <p className="font-sans text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
