"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

// Shared spring configs. Import these into feature components rather than
// writing new stiffness/damping/mass values inline.
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.6,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.9,
};

export const springSlow: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 20,
  mass: 1.2,
};

// Shared easing curves, for the rare case a duration-based (not spring-based)
// transition is more appropriate than a spring.
export const easeSettle = [0.16, 1, 0.3, 1] as const;
export const easeGentle = [0.4, 0, 0.2, 1] as const;

// Entrance for content arriving on screen (cards, list items, sections).
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: springSoft },
};

// Tap/press feedback for anything tappable — buttons, chips, icon actions.
// Usage: <motion.button variants={scalePress} initial="rest" whileTap="tap">
export const scalePress: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.96, transition: springSnappy },
};

// Expanding-ring pulse shared by pings, heartbeat sharing, and the candle
// ritual. Loops until unmounted.
export const ripple: Variants = {
  initial: { scale: 0.8, opacity: 0.6 },
  animate: {
    scale: 1.8,
    opacity: 0,
    transition: { duration: 1.6, ease: easeSettle, repeat: Infinity },
  },
};

// Same expanding-ring language as `ripple`, slower and dimmer — for
// moments that happen at night (the goodnight ritual) and should stay
// visually quiet rather than announce themselves.
export const nightSettle: Variants = {
  initial: { scale: 0.9, opacity: 0.35 },
  animate: {
    scale: 1.5,
    opacity: 0,
    transition: { duration: 3, ease: easeSettle, repeat: Infinity },
  },
};

// A time capsule's seal breaking the first time it's viewed unlocked —
// quicker and more decisive than `reveal` (a gentle mutual-answer unlock),
// with a slight twist rather than a straight scale-in. Built from
// springSnappy, not a new spring config.
export const sealBreak: Variants = {
  hidden: { opacity: 0, scale: 0.85, rotate: -3 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: springSnappy },
};

// Unlock/reveal for content that stays hidden until a condition is met
// (daily spark answers, parallel diary entries).
export const reveal: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: springSoft,
  },
};

// A notification/heart arriving from outside the viewport before settling
// into place — distinct from fadeRise's local, gentle arrival. Used by
// PingFeed for newly-received signals. Built from springSnappy, not a new
// spring config.
export const flyInSettle: Variants = {
  hidden: { opacity: 0, y: -40, scale: 1.4 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springSnappy },
};

const INSTANT: Transition = { duration: 0, repeat: 0 };

function instantVariants(variants: Variants): Variants {
  const next: Variants = {};
  for (const key of Object.keys(variants)) {
    const state = variants[key];
    next[key] = typeof state === "function" ? state : { ...state, transition: INSTANT };
  }
  return next;
}

/**
 * Wraps Framer's useReducedMotion so every feature reads motion preference
 * the same way: reduced motion becomes an instant state change (0-duration,
 * no repeat), never just a shorter version of the same animation.
 */
export function useReducedMotionSafe() {
  const prefersReducedMotion = Boolean(useReducedMotion());

  return {
    prefersReducedMotion,
    transition: (transition: Transition): Transition =>
      prefersReducedMotion ? INSTANT : transition,
    variants: (variants: Variants): Variants =>
      prefersReducedMotion ? instantVariants(variants) : variants,
  };
}
