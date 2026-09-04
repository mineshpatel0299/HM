"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * App-wide safety net: disables transform/layout animations under the
 * OS-level prefers-reduced-motion setting. Doesn't touch opacity/color
 * animations (Framer's own scope for this prop) — those still go through
 * useReducedMotionSafe()'s explicit variants()/transition() wrappers on a
 * per-component basis. Belt and suspenders, not a replacement for that.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
