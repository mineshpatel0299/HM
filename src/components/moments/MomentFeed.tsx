"use client";

import { AnimatePresence, motion } from "framer-motion";
import { flyInSettle, springSnappy, useReducedMotionSafe } from "@/lib/motion";
import { MOOD_TAGS, type MomentEvent } from "@/lib/moments/types";

function relativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

function moodEmoji(mood: string | null): string | null {
  return MOOD_TAGS.find((tag) => tag.value === mood)?.emoji ?? null;
}

export function MomentFeed({
  moments,
  myId,
  myName,
  partnerName,
}: {
  moments: MomentEvent[];
  myId: string;
  myName: string;
  partnerName: string;
}) {
  const { variants, transition } = useReducedMotionSafe();

  if (moments.length === 0) {
    return <p className="font-sans text-sm text-ink/70">no moments yet — share the first one.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {moments.map((moment) => (
          <motion.li
            key={moment.id}
            layout
            transition={transition(springSnappy)}
            variants={variants(flyInSettle)}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-dashed border-line bg-paper2 px-4 py-3"
          >
            <div className="flex items-center gap-2 font-sans text-xs text-ink/70">
              <span>{moment.authorId === myId ? myName : partnerName}</span>
              {moodEmoji(moment.mood) && <span aria-hidden="true">{moodEmoji(moment.mood)}</span>}
              {/* suppressHydrationWarning: this text is time-relative and
                  will legitimately differ by a second or two between server
                  render and client hydration — expected, not a real mismatch. */}
              <span className="ml-auto" suppressHydrationWarning>
                {relativeTime(moment.createdAt)}
              </span>
            </div>
            <p className="mt-1 font-sans text-sm text-ink">{moment.text}</p>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
