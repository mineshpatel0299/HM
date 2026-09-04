"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { flyInSettle, springSnappy, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import type { PingEvent } from "@/lib/pings/types";

const KIND_LABEL: Record<PingEvent["kind"], string> = {
  ping: "sent a ping",
  haptic: "sent a pattern",
  heartbeat: "shared their heartbeat",
};

const KIND_ICON: Record<PingEvent["kind"], string> = {
  ping: "♥",
  haptic: "〰",
  heartbeat: "💓",
};

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

export function PingFeed({
  coupleId,
  myId,
  partnerName,
  initialEvents,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  initialEvents: PingEvent[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const { variants, transition } = useReducedMotionSafe();

  useRealtimeEvent<PingEvent>("ping:new", (event) => {
    // This feed is an inbox ("addressed to the current user"), so only
    // events sent to me belong here — my own outgoing pings don't.
    if (event.coupleId !== coupleId || event.toId !== myId) return;
    setEvents((prev) => [event, ...prev].slice(0, 6));
  });

  // Keep "Xs/m/h ago" labels fresh without refetching anything.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (events.length === 0) {
    return <p className="font-sans text-sm text-ink/70">no signals yet — send the first one.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {events.map((event) => (
          <motion.li
            key={event.id}
            layout
            transition={transition(springSnappy)}
            variants={variants(flyInSettle)}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2 rounded-xl border border-dashed border-line bg-paper2 px-4 py-3 font-sans text-sm text-ink"
          >
            <span aria-hidden="true">{KIND_ICON[event.kind]}</span>
            <span>
              {partnerName} {KIND_LABEL[event.kind]}
            </span>
            {/* suppressHydrationWarning: time-relative text legitimately
                differs by a second or two between server render and client
                hydration. */}
            <span className="ml-auto text-xs text-ink/70" suppressHydrationWarning>
              {relativeTime(event.createdAt)}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
