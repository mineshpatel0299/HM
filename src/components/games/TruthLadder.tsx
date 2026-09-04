"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { LADDER_LEVELS } from "@/lib/truthladder/levels";
import { ackCurrentLevel } from "@/lib/truthladder/actions";

type ProgressEvent = { currentLevel: number; ackedBy: string[] };

export function TruthLadder({
  coupleId,
  myId,
  partnerName,
  initialLevel,
  initialAckedBy,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  initialLevel: number;
  initialAckedBy: string[];
}) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [ackedBy, setAckedBy] = useState<string[]>(initialAckedBy);
  const [isSaving, setIsSaving] = useState(false);
  const { variants } = useReducedMotionSafe();

  useRealtimeEvent<ProgressEvent>("truthladder:updated", (event) => {
    setCurrentLevel(event.currentLevel);
    setAckedBy(event.ackedBy);
  });

  const iAcked = ackedBy.includes(myId);
  const ladderComplete = currentLevel > LADDER_LEVELS.length;
  const current = LADDER_LEVELS.find((level) => level.level === currentLevel) ?? null;

  async function handleAck() {
    setIsSaving(true);
    const result = await ackCurrentLevel(coupleId);
    setIsSaving(false);
    if (result.ok) {
      setCurrentLevel(result.currentLevel);
      setAckedBy(result.ackedBy);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col-reverse gap-2">
        {LADDER_LEVELS.map((level) => {
          const isCurrent = level.level === currentLevel;
          const isDone = level.level < currentLevel;

          if (isCurrent) {
            return (
              <motion.div
                key={`current-${level.level}`}
                variants={variants(reveal)}
                initial="hidden"
                animate="visible"
                className="rounded-xl border border-ember bg-emberDark px-4 py-3 font-sans text-sm text-paper"
              >
                <span className="mr-2">{level.level}.</span>
                {level.title}
              </motion.div>
            );
          }

          return (
            <div
              key={level.level}
              className={`rounded-xl border px-4 py-3 font-sans text-sm ${
                isDone
                  ? "border-line bg-paper2 text-ink/70 line-through"
                  : "border-dashed border-line bg-paper text-ink/30"
              }`}
            >
              <span className="mr-2">{level.level}.</span>
              {level.title}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-paper2 p-5">
        {ladderComplete || !current ? (
          <p className="font-sans text-sm text-ink/70">
            you&apos;ve climbed the whole ladder together.
          </p>
        ) : (
          <>
            <p className="font-sans text-xs text-ink/70">
              level {current.level} — {current.title}
            </p>
            <p className="mt-1 font-display text-lg text-ink">{current.question}</p>
            <p className="mt-2 font-sans text-xs text-ink/70">
              talk it through in person or on a call, then both mark it answered to unlock the
              next level.
            </p>

            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              onClick={handleAck}
              disabled={isSaving || iAcked}
              className="mt-3 rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
            >
              {iAcked ? `waiting on ${partnerName}…` : "we answered this"}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
