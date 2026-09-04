"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";

export default function AuthError({
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
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <p className="font-sans text-sm text-ink/70">that didn&apos;t load right — give it another try.</p>
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
