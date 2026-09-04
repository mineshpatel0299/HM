"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";

export function WaitingForPartner({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable — the code is still
      // shown on screen, so there's nothing to fall back to here.
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-sans text-sm text-ink/70">waiting for them to join with your code.</p>
      <p className="rounded-2xl border border-dashed border-line bg-paper2 px-5 py-4 font-display text-3xl tracking-[0.3em] text-ink">
        {inviteCode}
      </p>
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-line px-4 py-2 font-sans text-xs text-ink"
      >
        {copied ? "copied" : "copy code"}
      </motion.button>
    </div>
  );
}
