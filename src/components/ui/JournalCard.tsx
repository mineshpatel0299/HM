"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeRise, useReducedMotionSafe } from "@/lib/motion";

// A handful of hand-cut corner presets rather than one uniform rounded-rect,
// so cards read as physical paper, not UI panels. Kept as a fixed set
// (instead of randomizing per render) so layout stays stable across renders.
const CORNER_PRESETS = {
  a: "1.1rem 1.6rem 1.3rem 0.9rem",
  b: "1.6rem 1rem 0.9rem 1.4rem",
  c: "0.9rem 1.3rem 1.7rem 1.1rem",
} as const;

type CornerVariant = keyof typeof CORNER_PRESETS;

type JournalCardProps = HTMLMotionProps<"div"> & {
  /** Degrees of tilt, for the scrapbook feel when used for notes/photos. */
  rotation?: number;
  corner?: CornerVariant;
  /** Plays the shared fadeRise entrance. Off for cards already on screen. */
  animateIn?: boolean;
};

export function JournalCard({
  rotation = 0,
  corner = "a",
  animateIn = true,
  className = "",
  style,
  children,
  ...props
}: JournalCardProps) {
  const { variants } = useReducedMotionSafe();

  return (
    <motion.div
      variants={animateIn ? variants(fadeRise) : undefined}
      initial={animateIn ? "hidden" : undefined}
      animate={animateIn ? "visible" : undefined}
      style={{
        borderRadius: CORNER_PRESETS[corner],
        rotate: rotation,
        ...style,
      }}
      className={`border border-line bg-paper2 p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
