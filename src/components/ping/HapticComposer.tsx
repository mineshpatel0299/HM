"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { scalePress, springSnappy, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { sendPing } from "@/lib/pings/actions";
import type { HapticPayload, PingEvent } from "@/lib/pings/types";

const SHORT_LONG_THRESHOLD_MS = 300;

/**
 * Schedules a visual on/off pulse matching a Vibration-API-style pattern
 * (alternating vibrate/pause durations), independent of whether the device
 * actually supports navigator.vibrate. Shared by the composer's preview and
 * the receiver's playback so both look identical.
 */
function playPatternVisually(pattern: number[], setActive: (active: boolean) => void) {
  let elapsed = 0;
  pattern.forEach((duration, index) => {
    const isVibrateSegment = index % 2 === 0;
    if (isVibrateSegment) {
      window.setTimeout(() => setActive(true), elapsed);
      window.setTimeout(() => setActive(false), elapsed + duration);
    }
    elapsed += duration;
  });
}

function PulseDot({ active }: { active: boolean }) {
  const { transition } = useReducedMotionSafe();
  return (
    <motion.span
      animate={{ scale: active ? 1.25 : 1, opacity: active ? 1 : 0.55 }}
      transition={transition(springSnappy)}
      className="flex h-24 w-24 items-center justify-center rounded-full bg-emberDark text-3xl text-paper"
      aria-hidden="true"
    >
      ♥
    </motion.span>
  );
}

export function HapticComposer({ coupleId }: { coupleId: string }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const pressStartRef = useRef<number | null>(null);
  const lastReleaseRef = useRef<number | null>(null);

  // The pad below measures real hold duration — there's no keyboard
  // equivalent to "how long was this key held," so these two buttons are a
  // genuine (not cosmetic) alternative: same alternating pulse/gap shape,
  // fixed durations instead of measured ones.
  function addFixedPulse(duration: number) {
    setPattern((prev) => (prev.length === 0 ? [duration] : [...prev, 150, duration]));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const now = performance.now();
    if (lastReleaseRef.current !== null) {
      setPattern((prev) => [...prev, Math.round(now - lastReleaseRef.current!)]);
    }
    pressStartRef.current = now;
  }

  function handlePointerUp() {
    if (pressStartRef.current === null) return;
    const now = performance.now();
    setPattern((prev) => [...prev, Math.round(now - pressStartRef.current!)]);
    pressStartRef.current = null;
    lastReleaseRef.current = now;
  }

  function handleClear() {
    setPattern([]);
    setName("");
    setSent(false);
    setError(null);
    pressStartRef.current = null;
    lastReleaseRef.current = null;
  }

  function handlePreview() {
    if (pattern.length === 0 || isPlaying) return;
    setIsPlaying(true);
    playPatternVisually(pattern, setIsPlaying);
    const total = pattern.reduce((sum, d) => sum + d, 0);
    window.setTimeout(() => setIsPlaying(false), total);
  }

  async function handleSend() {
    if (pattern.length === 0) return;
    setError(null);
    setIsSending(true);
    const payload: HapticPayload = { name: name.trim() || "a pattern", pattern };
    const result = await sendPing(coupleId, "haptic", payload);
    setIsSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <h2 className="font-display text-2xl">tap out a pattern</h2>
      <p className="text-center font-sans text-sm text-ink/70">
        tap for a short pulse, hold for a long one. three short taps means
        &ldquo;I miss you.&rdquo;
      </p>

      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex h-32 w-32 select-none items-center justify-center rounded-full border border-dashed border-line bg-paper2 font-sans text-xs text-ink/70 active:bg-paper"
        aria-hidden="true"
      >
        press &amp; hold
      </div>

      <div className="flex gap-2">
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={() => addFixedPulse(150)}
          className="rounded-full border border-line px-3 py-1.5 font-sans text-xs text-ink"
        >
          add short pulse
        </motion.button>
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={() => addFixedPulse(500)}
          className="rounded-full border border-line px-3 py-1.5 font-sans text-xs text-ink"
        >
          add long pulse
        </motion.button>
      </div>

      <div className="flex min-h-6 flex-wrap items-center justify-center gap-1">
        {pattern.map((duration, index) =>
          index % 2 === 0 ? (
            <span
              key={index}
              className="rounded-full bg-ember/70"
              style={{
                width: duration >= SHORT_LONG_THRESHOLD_MS ? 28 : 12,
                height: 8,
              }}
              aria-hidden="true"
            />
          ) : null,
        )}
      </div>

      <div className="flex gap-2">
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={handlePreview}
          disabled={pattern.length === 0 || isPlaying}
          className="rounded-full border border-line px-4 py-2 font-sans text-xs text-ink disabled:opacity-50"
        >
          preview
        </motion.button>
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={handleClear}
          disabled={pattern.length === 0}
          className="rounded-full border border-line px-4 py-2 font-sans text-xs text-ink disabled:opacity-50"
        >
          clear
        </motion.button>
      </div>

      <PulseDot active={isPlaying} />

      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="name it — “I miss you”"
        aria-label="pattern name"
        className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-center font-sans text-sm text-ink outline-none focus:border-ember"
      />

      {error && <p className="font-sans text-sm text-emberDark">{error}</p>}
      {sent && <p className="font-sans text-sm text-ink">sent.</p>}

      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleSend}
        disabled={pattern.length === 0 || isSending}
        className="w-full rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
      >
        {isSending ? "sending…" : "send pattern"}
      </motion.button>
    </div>
  );
}

/**
 * Mounted once at the app shell level (not just on this feature's page) so
 * an incoming pattern replays wherever the partner happens to be in the app.
 */
export function HapticReceiver({ myId, partnerName }: { myId: string; partnerName: string }) {
  const [incoming, setIncoming] = useState<HapticPayload | null>(null);
  const [active, setActive] = useState(false);
  const { prefersReducedMotion } = useReducedMotionSafe();

  const play = useCallback(
    (payload: HapticPayload) => {
      setIncoming(payload);
      const supportsVibration = typeof navigator !== "undefined" && "vibrate" in navigator;
      if (supportsVibration && !prefersReducedMotion) {
        navigator.vibrate(payload.pattern);
      }
      playPatternVisually(payload.pattern, setActive);
      const total = payload.pattern.reduce((sum, d) => sum + d, 0);
      window.setTimeout(() => setIncoming(null), total + 1200);
    },
    [prefersReducedMotion],
  );

  useRealtimeEvent<PingEvent>("ping:new", (event) => {
    if (event.kind !== "haptic" || event.toId !== myId) return;
    play(event.payload as HapticPayload);
  });

  if (!incoming) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2">
      <PulseDot active={active} />
      <p className="rounded-full bg-ink/90 px-4 py-2 font-sans text-xs text-paper">
        {partnerName} sent &ldquo;{incoming.name}&rdquo;
      </p>
    </div>
  );
}
