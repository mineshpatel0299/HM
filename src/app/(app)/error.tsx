"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-16 text-center">
      <p className="font-display text-2xl text-ink">something didn&apos;t load right</p>
      <p className="font-sans text-sm text-ink/70">that&apos;s on us, not you — give it another try.</p>
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={reset}
        className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper"
      >
        try again
      </motion.button>
    </div>
  );
}
