"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { springSnappy, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { sendPing } from "@/lib/pings/actions";
import { detectBpm, type BrightnessSample } from "@/lib/heartbeat/detectBpm";
import type { HeartbeatPayload, PingEvent } from "@/lib/pings/types";

const SAMPLE_INTERVAL_MS = 50;
const SAMPLE_WINDOW_MS = 15_000;
const LIVE_WINDOW_MS = 3_000;
const CAPTURE_SIZE = 24;

type CaptureState = "idle" | "requesting" | "sampling" | "processing" | "done" | "error";

function friendlyCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "camera access was denied — allow it in your browser's site settings and try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "no camera found on this device.";
  }
  if (name === "NotReadableError") {
    return "the camera's in use by something else right now — close other apps using it and try again.";
  }
  return "couldn't access the camera — try again.";
}

/** Sender-side capture UI. */
function HeartbeatCapture({ coupleId }: { coupleId: string }) {
  const [state, setState] = useState<CaptureState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(SAMPLE_WINDOW_MS / 1000);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<HeartbeatPayload | null>(null);
  const [livePulse, setLivePulse] = useState(false);
  const { transition } = useReducedMotionSafe();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const samplesRef = useRef<BrightnessSample[]>([]);
  const lastLivePeakAtRef = useRef<number>(-Infinity);
  const timersRef = useRef<number[]>([]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    timersRef.current.forEach((id) => window.clearInterval(id));
    timersRef.current = [];
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  async function handleStart() {
    setErrorMessage(null);
    setResult(null);
    setState("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
    } catch (error) {
      setErrorMessage(friendlyCameraError(error));
      setState("error");
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    video.srcObject = stream;
    await video.play().catch(() => undefined);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      setErrorMessage("this browser can't process the camera feed.");
      setState("error");
      stopCamera();
      return;
    }

    samplesRef.current = [];
    lastLivePeakAtRef.current = -Infinity;
    const start = performance.now();
    setState("sampling");
    setSecondsLeft(SAMPLE_WINDOW_MS / 1000);

    const sampleTimer = window.setInterval(() => {
      const t = performance.now() - start;
      ctx.drawImage(video, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
      const frame = ctx.getImageData(0, 0, CAPTURE_SIZE, CAPTURE_SIZE).data;
      let redSum = 0;
      const pixelCount = frame.length / 4;
      for (let i = 0; i < frame.length; i += 4) redSum += frame[i];
      const avgRed = redSum / pixelCount;
      samplesRef.current.push({ t, value: avgRed });

      // Live pulse: re-run the same detector on just the last ~3s so the
      // heart on screen roughly tracks real beats as they're found, without
      // duplicating the peak-detection logic.
      const recent = samplesRef.current.filter((s) => t - s.t <= LIVE_WINDOW_MS);
      const live = detectBpm(recent);
      if (live) {
        const lastInterval = live.intervals[live.intervals.length - 1];
        if (t - lastLivePeakAtRef.current > lastInterval * 0.6) {
          lastLivePeakAtRef.current = t;
          setLivePulse(true);
          window.setTimeout(() => setLivePulse(false), 150);
        }
      }

      if (t >= SAMPLE_WINDOW_MS) {
        window.clearInterval(sampleTimer);
        finishSampling();
      } else {
        setSecondsLeft(Math.max(0, Math.ceil((SAMPLE_WINDOW_MS - t) / 1000)));
      }
    }, SAMPLE_INTERVAL_MS);
    timersRef.current.push(sampleTimer);
  }

  async function finishSampling() {
    setState("processing");
    stopCamera();

    const detected = detectBpm(samplesRef.current);
    if (!detected) {
      setErrorMessage(
        "couldn't get a clear reading — hold your fingertip fully over the camera, keep still, and try again.",
      );
      setState("error");
      return;
    }

    const payload: HeartbeatPayload = { bpm: detected.bpm, intervals: detected.intervals };
    const sendResult = await sendPing(coupleId, "heartbeat", payload);
    if (!sendResult.ok) {
      setErrorMessage(sendResult.error);
      setState("error");
      return;
    }

    setResult(payload);
    setState("done");
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* off-screen capture surfaces */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} width={CAPTURE_SIZE} height={CAPTURE_SIZE} className="hidden" />

      <motion.div
        animate={{ scale: livePulse ? 1.2 : 1 }}
        transition={transition(springSnappy)}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-emberDark text-4xl text-paper"
        aria-hidden="true"
      >
        💓
      </motion.div>

      {state === "idle" && (
        <>
          <p className="max-w-xs text-center font-sans text-sm text-ink/70">
            cover your camera lens completely with a fingertip, then start —
            it takes about 15 seconds.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper"
          >
            start
          </motion.button>
        </>
      )}

      {state === "requesting" && (
        <p className="font-sans text-sm text-ink/70">asking for camera access…</p>
      )}

      {state === "sampling" && (
        <p className="font-sans text-sm text-ink/70">
          hold still — {secondsLeft}s left
        </p>
      )}

      {state === "processing" && (
        <p className="font-sans text-sm text-ink/70">reading your pulse…</p>
      )}

      {state === "error" && (
        <>
          <p className="max-w-xs text-center font-sans text-sm text-emberDark">{errorMessage}</p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper"
          >
            try again
          </motion.button>
        </>
      )}

      {state === "done" && result && (
        <>
          <p className="font-display text-3xl text-ink">{result.bpm} bpm</p>
          <p className="font-sans text-sm text-ink">sent to your partner.</p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setState("idle")}
            className="rounded-full border border-line px-4 py-2 font-sans text-xs text-ink"
          >
            share again
          </motion.button>
        </>
      )}
    </div>
  );
}

/** Receiving-side playback, driven by the partner's actual captured rhythm. */
function HeartbeatReceiver({ myId, partnerName }: { myId: string; partnerName: string }) {
  const [incoming, setIncoming] = useState<HeartbeatPayload | null>(null);
  const controls = useAnimation();
  const { prefersReducedMotion } = useReducedMotionSafe();

  const play = useCallback(
    (payload: HeartbeatPayload) => {
      if (prefersReducedMotion) return;
      let elapsed = 0;
      controls.start({ scale: [1, 1.3, 1], transition: { duration: 0.3 } });
      payload.intervals.forEach((interval) => {
        elapsed += interval;
        window.setTimeout(() => {
          controls.start({ scale: [1, 1.3, 1], transition: { duration: 0.3 } });
        }, elapsed);
      });
    },
    [controls, prefersReducedMotion],
  );

  useRealtimeEvent<PingEvent>("ping:new", (event) => {
    if (event.kind !== "heartbeat" || event.toId !== myId) return;
    const payload = event.payload as HeartbeatPayload;
    setIncoming(payload);
    play(payload);
  });

  if (!incoming) {
    return (
      <p className="font-sans text-sm text-ink/70">
        nothing shared yet — ask {partnerName} to share their heartbeat.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={controls}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-emberDark text-4xl text-paper"
        aria-hidden="true"
      >
        💓
      </motion.div>
      <p className="font-display text-2xl text-ink">{incoming.bpm} bpm</p>
      <p className="font-sans text-sm text-ink/70">{partnerName}&apos;s heartbeat</p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => play(incoming)}
        className="rounded-full border border-line px-4 py-2 font-sans text-xs text-ink"
      >
        play again
      </motion.button>
    </div>
  );
}

export function HeartbeatShare({
  coupleId,
  myId,
  partnerName,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col items-center gap-3">
        <h2 className="font-display text-2xl">share your heartbeat</h2>
        <HeartbeatCapture coupleId={coupleId} />
      </div>
      <div className="border-t border-dashed border-line pt-6">
        <h3 className="mb-3 text-center font-display text-xl">{partnerName}&apos;s turn</h3>
        <HeartbeatReceiver myId={myId} partnerName={partnerName} />
      </div>
    </div>
  );
}
