"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeRise, useReducedMotionSafe } from "@/lib/motion";
import { PushNotifications } from "@/components/push/PushNotifications";
import { HeartHandshake } from "lucide-react";

export function AppHome({ children }: { children: ReactNode }) {
  const { variants } = useReducedMotionSafe();

  return (
    <motion.div
      variants={variants(fadeRise)}
      initial="hidden"
      animate="visible"
      className="flex w-full max-w-2xl mx-auto flex-col gap-6"
    >
      <header className="flex items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/80 shadow-glass">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-semibold tracking-wider text-ember uppercase">Private Thread</span>
            <span className="h-1 w-1 rounded-full bg-ember" />
            <span className="font-sans text-xs text-ink-muted">Live Sync</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink font-semibold tracking-tight">
            Two skies, one heart
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember/10 border border-ember/20 text-ember">
          <HeartHandshake className="h-6 w-6" />
        </div>
      </header>

      <PushNotifications />

      {children}
    </motion.div>
  );
}
