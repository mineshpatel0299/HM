"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { springSnappy, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { sendPing } from "@/lib/pings/actions";
import { detectBpm, type BrightnessSample } from "@/lib/heartbeat/detectBpm";
import type { HeartbeatPayload, PingEvent } from "@/lib/pings/types";
import { Heart, Activity, Camera, RefreshCw, AlertCircle } from "lucide-react";

const SAMPLE_INTERVAL_MS = 50;
const SAMPLE_WINDOW_MS = 15_000;
const LIVE_WINDOW_MS = 3_000;
const CAPTURE_SIZE = 24;

type CaptureState = "idle" | "requesting" | "sampling" | "processing" | "done" | "error";

function friendlyCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera access was denied — allow camera permissions in browser settings.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera found on this device.";
  }
  if (name === "NotReadableError") {
    return "Camera is in use by another app right now.";
  }
  return "Could not access camera — please try again.";
}

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
      setErrorMessage("This browser cannot process the camera feed.");
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
      setErrorMessage("Could not get a clear pulse reading — cover camera lens completely with your fingertip.");
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
    <div className="flex flex-col items-center gap-4 text-center">
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} width={CAPTURE_SIZE} height={CAPTURE_SIZE} className="hidden" />

      <motion.div
        animate={{ scale: livePulse ? 1.25 : 1 }}
        transition={transition(springSnappy)}
        className="flex h-24 w-24 items-center justify-center rounded-full gradient-btn text-white shadow-xl shadow-ember/30 my-1"
        aria-hidden="true"
      >
        <Heart className={`h-10 w-10 fill-white/40 ${livePulse ? "animate-ping" : ""}`} />
      </motion.div>

      {state === "idle" && (
        <>
          <p className="max-w-xs font-sans text-xs text-ink-muted leading-relaxed">
            Cover your camera lens completely with your fingertip, then start (~15s scan).
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="flex items-center gap-2 rounded-2xl gradient-btn px-6 py-3 font-sans text-xs font-semibold text-white shadow-md"
          >
            <Camera className="h-4 w-4" />
            <span>Measure Pulse</span>
          </motion.button>
        </>
      )}

      {state === "requesting" && (
        <p className="font-sans text-xs text-ink-muted animate-pulse">Requesting camera access...</p>
      )}

      {state === "sampling" && (
        <div className="flex flex-col gap-1 items-center">
          <span className="font-display text-2xl font-bold text-ember">{secondsLeft}s</span>
          <p className="font-sans text-xs text-ink-muted">Hold your fingertip still over camera...</p>
        </div>
      )}

      {state === "processing" && (
        <p className="font-sans text-xs text-ink-muted animate-pulse">Analyzing pulse waveform...</p>
      )}

      {state === "error" && (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 border border-rose-500/20 max-w-xs font-sans font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="flex items-center gap-1.5 rounded-2xl gradient-btn px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </motion.button>
        </>
      )}

      {state === "done" && result && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-3xl font-bold text-ink">{result.bpm} BPM</span>
          <span className="text-xs font-sans text-emerald-700 font-medium">Pulse sent to partner!</span>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setState("idle")}
            className="rounded-xl border border-line bg-white/70 px-4 py-2 font-sans text-xs font-medium text-ink hover:bg-paper2"
          >
            Share Again
          </motion.button>
        </div>
      )}
    </div>
  );
}

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
      <p className="font-sans text-xs text-ink-muted italic">
        No heartbeat received yet — ask {partnerName} to measure theirs!
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={controls}
        className="flex h-20 w-20 items-center justify-center rounded-full gradient-btn text-white shadow-xl shadow-ember/30"
        aria-hidden="true"
      >
        <Heart className="h-8 w-8 fill-white/40" />
      </motion.div>
      <div className="flex flex-col items-center">
        <span className="font-display text-2xl font-bold text-ink">{incoming.bpm} BPM</span>
        <span className="text-xs font-sans text-ink-muted">{partnerName}&apos;s live pulse</span>
      </div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => play(incoming)}
        className="rounded-xl border border-line bg-white/70 px-3.5 py-1.5 font-sans text-xs font-semibold text-ink hover:bg-paper2"
      >
        Replay Pulse
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
    <div className="flex flex-col gap-6 rounded-3xl glass-card p-6 border border-white/80 shadow-glass">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <Activity className="h-5 w-5 text-ember" />
        <h2 className="font-display text-lg font-bold text-ink">Heartbeat Sync</h2>
      </div>

      <div className="flex flex-col gap-6">
        <HeartbeatCapture coupleId={coupleId} />
        <div className="pt-4 border-t border-line text-center flex flex-col items-center gap-3">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink-muted">
            {partnerName}&apos;s Heartbeat
          </span>
          <HeartbeatReceiver myId={myId} partnerName={partnerName} />
        </div>
      </div>
    </div>
  );
}
