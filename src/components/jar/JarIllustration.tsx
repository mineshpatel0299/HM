"use client";

import { motion } from "framer-motion";
import { springSoft, useReducedMotionSafe } from "@/lib/motion";

const MAX_VISIBLE_DOTS = 24;
const TOP_Y = 32;
const BOTTOM_Y = 104;
const DOT_FILL_CLASSES = ["fill-ember", "fill-lilac", "fill-amber"];

// Deterministic pseudo-random scatter, not Math.random(), so dots don't
// reshuffle position on every re-render. Later dots (higher count) land
// higher in the jar, so it visually fills from the bottom up.
function dotPosition(index: number, fillFraction: number): { cx: number; cy: number } {
  const bandTop = BOTTOM_Y - fillFraction * (BOTTOM_Y - TOP_Y);
  const hashX = (((index * 2654435761) >>> 0) % 1000) / 1000;
  const hashY = (((index * 40503 + 13) >>> 0) % 1000) / 1000;
  return { cx: 26 + hashX * 48, cy: bandTop + hashY * (BOTTOM_Y - bandTop) };
}

export function JarIllustration({ count }: { count: number }) {
  const { variants } = useReducedMotionSafe();
  const visible = Math.min(count, MAX_VISIBLE_DOTS);
  const fillFraction = Math.min(visible / MAX_VISIBLE_DOTS, 1);

  return (
    <div className="mx-auto flex flex-col items-center">
      <svg width="140" height="150" viewBox="0 0 100 120">
        <rect x="30" y="6" width="40" height="10" rx="3" className="fill-emberDark" />
        <rect x="34" y="14" width="32" height="6" rx="2" className="fill-ember" />
        <path
          d="M22 22 L18 100 Q18 112 30 112 L70 112 Q82 112 82 100 L78 22 Z"
          className="fill-paper2 stroke-line"
          strokeWidth="1.5"
        />
        <clipPath id="jar-body-clip">
          <path d="M22 22 L18 100 Q18 112 30 112 L70 112 Q82 112 82 100 L78 22 Z" />
        </clipPath>
        <g clipPath="url(#jar-body-clip)">
          {Array.from({ length: visible }, (_, i) => {
            const { cx, cy } = dotPosition(i, fillFraction);
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="3"
                className={DOT_FILL_CLASSES[i % DOT_FILL_CLASSES.length]}
                variants={variants({
                  hidden: { scale: 0 },
                  visible: { scale: 1, transition: springSoft },
                })}
                initial="hidden"
                animate="visible"
              />
            );
          })}
        </g>
      </svg>
      <p className="font-sans text-xs text-ink/70">
        {count === 0 ? "the jar is empty" : count === 1 ? "1 note waiting" : `${count} notes waiting`}
      </p>
    </div>
  );
}
