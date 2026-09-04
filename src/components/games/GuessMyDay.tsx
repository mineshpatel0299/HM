"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { easeSettle, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { submitPrediction, scorePrediction } from "@/lib/guessday/actions";
import type { PredictionRow } from "@/lib/guessday/queries";

export function GuessMyDay({
  coupleId,
  myId,
  partnerName,
  predictDate,
  initialMine,
  initialPartnerRow,
  initialMyScore,
  initialPartnerScore,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  predictDate: string;
  initialMine: PredictionRow | null;
  initialPartnerRow: PredictionRow | null;
  initialMyScore: number;
  initialPartnerScore: number;
}) {
  const [mine, setMine] = useState(initialMine);
  const [partnerRow, setPartnerRow] = useState(initialPartnerRow);
  const [myScore, setMyScore] = useState(initialMyScore);
  const [partnerScore, setPartnerScore] = useState(initialPartnerScore);
  const [draft, setDraft] = useState("");
  const [actualDraft, setActualDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justScored, setJustScored] = useState(false);
  const { transition } = useReducedMotionSafe();

  useRealtimeEvent<{ id: string; authorId: string; predictDate: string; prediction: string }>(
    "guessday:submitted",
    (event) => {
      if (event.predictDate !== predictDate || event.authorId === myId) return;
      setPartnerRow({
        id: event.id,
        authorId: event.authorId,
        prediction: event.prediction,
        actual: null,
        correct: null,
      });
    },
  );

  useRealtimeEvent<{ predictionId: string; actual: string; correct: boolean; authorId: string }>(
    "guessday:scored",
    (event) => {
      if (event.authorId !== myId) return; // this was my prediction, now scored
      setMine((prev) => (prev ? { ...prev, actual: event.actual, correct: event.correct } : prev));
      if (event.correct) {
        setMyScore((score) => score + 1);
        setJustScored(true);
        window.setTimeout(() => setJustScored(false), 1200);
      }
    },
  );

  async function handleSubmit() {
    if (!draft.trim()) return;
    setIsSubmitting(true);
    const result = await submitPrediction(coupleId, predictDate, draft.trim());
    setIsSubmitting(false);
    if (result.ok) {
      setMine({ id: "", authorId: myId, prediction: draft.trim(), actual: null, correct: null });
    }
  }

  async function handleScore(correct: boolean) {
    if (!partnerRow || !actualDraft.trim()) return;
    const result = await scorePrediction(coupleId, partnerRow.id, actualDraft.trim(), correct);
    if (result.ok) {
      setPartnerRow((prev) => (prev ? { ...prev, actual: actualDraft.trim(), correct } : prev));
      if (correct) setPartnerScore((score) => score + 1);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between font-sans text-xs text-ink/70">
        <span>you: {myScore} correct</span>
        <span>
          {partnerName}: {partnerScore} correct
        </span>
      </div>

      <div className="rounded-2xl border border-line bg-paper2 p-5">
        <p className="font-sans text-xs text-ink/70">your guess about {partnerName}&apos;s day</p>
        {mine ? (
          <>
            <p className="mt-1 font-sans text-sm text-ink">{mine.prediction}</p>
            {mine.correct !== null && (
              <motion.p
                animate={{ scale: justScored ? [1, 1.35, 1] : 1 }}
                transition={transition({ duration: 0.4, ease: easeSettle })}
                className={`mt-2 font-sans text-xs ${mine.correct ? "text-ink" : "text-emberDark"}`}
              >
                {mine.correct ? "✓ you got it" : "✗ not quite"} — {mine.actual}
              </motion.p>
            )}
          </>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="I bet you'll..."
              aria-label="your prediction"
              className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
            />
            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              onClick={handleSubmit}
              disabled={isSubmitting || !draft.trim()}
              className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
            >
              guess
            </motion.button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-paper2 p-5">
        <p className="font-sans text-xs text-ink/70">{partnerName}&apos;s guess about your day</p>
        {!partnerRow ? (
          <p className="mt-1 font-sans text-sm text-ink/70">no guess yet.</p>
        ) : (
          <>
            <p className="mt-1 font-sans text-sm text-ink">{partnerRow.prediction}</p>
            {partnerRow.correct === null ? (
              <div className="mt-2 flex flex-col gap-2">
                <input
                  value={actualDraft}
                  onChange={(event) => setActualDraft(event.target.value)}
                  placeholder="what actually happened?"
                  aria-label="what actually happened"
                  className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
                />
                <div className="flex gap-2">
                  <motion.button
                    variants={scalePress}
                    initial="rest"
                    whileTap="tap"
                    onClick={() => handleScore(true)}
                    disabled={!actualDraft.trim()}
                    className="rounded-full bg-sage px-4 py-2 font-sans text-xs text-ink disabled:opacity-50"
                  >
                    they got it
                  </motion.button>
                  <motion.button
                    variants={scalePress}
                    initial="rest"
                    whileTap="tap"
                    onClick={() => handleScore(false)}
                    disabled={!actualDraft.trim()}
                    className="rounded-full border border-line px-4 py-2 font-sans text-xs text-ink disabled:opacity-50"
                  >
                    not quite
                  </motion.button>
                </div>
              </div>
            ) : (
              <p
                className={`mt-2 font-sans text-xs ${partnerRow.correct ? "text-ink" : "text-emberDark"}`}
              >
                {partnerRow.correct ? "✓ correct" : "✗ incorrect"} — {partnerRow.actual}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
