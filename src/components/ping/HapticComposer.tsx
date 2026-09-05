"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { scalePress, springSnappy, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { sendPing } from "@/lib/pings/actions";
import type { HapticPayload, PingEvent } from "@/lib/pings/types";
import { Play, RotateCcw, Send, Heart, Fingerprint } from "lucide-react";

const SHORT_LONG_THRESHOLD_MS = 300;

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
    <motion.div
      animate={{ scale: active ? 1.3 : 1, opacity: active ? 1 : 0.6 }}
      transition={transition(springSnappy)}
      className="flex h-20 w-20 items-center justify-center rounded-full gradient-btn text-white shadow-lg shadow-ember/30"
      aria-hidden="true"
    >
      <Heart className={`h-9 w-9 fill-white/40 ${active ? "animate-pulse" : ""}`} />
    </motion.div>
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
    const payload: HapticPayload = { name: name.trim() || "a secret code", pattern };
    const result = await sendPing(coupleId, "haptic", payload);
    setIsSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl glass-card p-6 border border-white/80 shadow-glass">
      <div className="flex flex-col gap-1 text-center">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ember">
          Haptic Touch Pattern
        </span>
        <h3 className="font-display text-xl font-bold text-ink">Tap Out a Secret Pulse</h3>
        <p className="font-sans text-xs text-ink-muted">
          Tap for short pulses, hold for long ones to compose a custom vibration pattern.
        </p>
      </div>

      {/* Interactive Touch Pad */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex h-36 w-36 select-none flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-ember/40 bg-gradient-to-br from-paper2 to-white font-sans text-xs font-semibold text-ember active:scale-95 transition-all shadow-inner cursor-pointer"
        aria-hidden="true"
      >
        <Fingerprint className="h-6 w-6 text-ember animate-pulse" />
        <span>Press &amp; Hold</span>
      </div>

      {/* Preset Quick Pulse Buttons */}
      <div className="flex gap-2">
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={() => addFixedPulse(150)}
          className="rounded-xl border border-line bg-white/70 px-3 py-1.5 font-sans text-xs font-medium text-ink hover:bg-paper2 transition-colors shadow-sm"
        >
          + Short Pulse
        </motion.button>
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={() => addFixedPulse(500)}
          className="rounded-xl border border-line bg-white/70 px-3 py-1.5 font-sans text-xs font-medium text-ink hover:bg-paper2 transition-colors shadow-sm"
        >
          + Long Pulse
        </motion.button>
      </div>

      {/* Pattern Visualizer Bars */}
      <div className="flex min-h-[24px] items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-paper2/70 border border-line w-full max-w-xs overflow-x-auto">
        {pattern.length === 0 ? (
          <span className="text-[11px] font-sans text-ink-muted italic">Pattern waveform will appear here...</span>
        ) : (
          pattern.map((duration, index) =>
            index % 2 === 0 ? (
              <span
                key={index}
                className="rounded-full bg-gradient-to-r from-ember to-amber shadow-sm"
                style={{
                  width: duration >= SHORT_LONG_THRESHOLD_MS ? 28 : 12,
                  height: 10,
                }}
                aria-hidden="true"
              />
            ) : null,
          )
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={handlePreview}
          disabled={pattern.length === 0 || isPlaying}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-ink disabled:opacity-50 shadow-sm"
        >
          <Play className="h-3.5 w-3.5 text-amber" />
          <span>Preview</span>
        </motion.button>
        <motion.button
          variants={scalePress}
          initial="rest"
          whileTap="tap"
          type="button"
          onClick={handleClear}
          disabled={pattern.length === 0}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-ink disabled:opacity-50 shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 text-ink-muted" />
          <span>Clear</span>
        </motion.button>
      </div>

      <PulseDot active={isPlaying} />

      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Give your pulse a name (e.g., 'Thinking of you')"
        aria-label="pattern name"
        className="w-full max-w-xs rounded-2xl glass-input px-4 py-2.5 text-center font-sans text-xs text-ink placeholder:text-ink-muted outline-none"
      />

      {error && <p className="font-sans text-xs text-rose-600 font-medium">{error}</p>}
      {sent && <p className="font-sans text-xs text-emerald-700 font-medium">Haptic signal sent successfully!</p>}

      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleSend}
        disabled={pattern.length === 0 || isSending}
        className="w-full max-w-xs rounded-2xl gradient-btn px-5 py-3 font-sans text-xs font-semibold text-white shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Send className="h-4 w-4" />
        <span>{isSending ? "Sending Pulse..." : "Send Touch Signal"}</span>
      </motion.button>
    </div>
  );
}

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
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex flex-col items-center gap-2">
      <PulseDot active={active} />
      <p className="rounded-full bg-slate-900/90 backdrop-blur-md border border-white/20 px-5 py-2 font-sans text-xs font-semibold text-white shadow-2xl">
        {partnerName} sent &ldquo;{incoming.name}&rdquo;
      </p>
    </div>
  );
}
