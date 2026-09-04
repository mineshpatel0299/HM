"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { fadeRise, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { sendTestPing } from "./actions";

type PingEvent = { fromName: string; sentAt: string };

export function RealtimeTest({ coupleId, myName }: { coupleId: string; myName: string }) {
  const [isPending, startTransition] = useTransition();
  const [received, setReceived] = useState<PingEvent[]>([]);
  const { variants } = useReducedMotionSafe();

  useRealtimeEvent<PingEvent>("ping:test", (data) => {
    setReceived((prev) => [data, ...prev].slice(0, 5));
  });

  function handleSend() {
    startTransition(async () => {
      await sendTestPing(coupleId, myName);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h2 className="font-display text-2xl">realtime test</h2>
      <p className="font-sans text-sm text-ink/70">
        send a ping — the other session should see it appear within a second.
      </p>
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        onClick={handleSend}
        disabled={isPending}
        className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
      >
        {isPending ? "sending…" : "send a ping"}
      </motion.button>

      <div className="flex flex-col gap-2">
        {received.map((event, index) => (
          <motion.p
            key={event.sentAt + index}
            variants={variants(fadeRise)}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-dashed border-line bg-paper2 px-4 py-3 font-sans text-sm text-ink"
          >
            {event.fromName} pinged at {new Date(event.sentAt).toLocaleTimeString()}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
