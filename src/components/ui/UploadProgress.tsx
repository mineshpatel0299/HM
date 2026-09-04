"use client";

import { motion } from "framer-motion";
import { springSoft, useReducedMotionSafe } from "@/lib/motion";

export function UploadProgress({ progress }: { progress: number }) {
  const { transition } = useReducedMotionSafe();
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-line/40"
    >
      <motion.div
        className="h-full rounded-full bg-ember"
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={transition(springSoft)}
      />
    </div>
  );
}
