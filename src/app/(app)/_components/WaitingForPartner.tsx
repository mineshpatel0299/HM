"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { Copy, Check, Clock } from "lucide-react";

export function WaitingForPartner({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10 text-amber">
        <Clock className="h-6 w-6 animate-pulse" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-bold text-ink">Waiting for Your Partner</h3>
        <p className="font-sans text-xs text-ink-muted">
          Share your invite code so they can connect to your thread.
        </p>
      </div>

      <div className="relative flex items-center justify-between w-full max-w-xs rounded-2xl bg-paper2/90 border border-ember/30 px-5 py-3.5 my-1">
        <span className="font-display text-2xl font-bold tracking-[0.25em] text-ember">
          {inviteCode}
        </span>
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ember shadow-sm hover:scale-105 transition-transform"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  );
}
