"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { submitMoodCheckin } from "@/lib/moodcheckin/actions";

const FACES = ["😞", "😕", "😐", "🙂", "😄"];
const FACE_LABELS = ["rough day", "not great", "okay", "good day", "great day"];

export function MoodCheckin({
  coupleId,
  alreadyCheckedInToday,
  initialScore,
}: {
  coupleId: string;
  alreadyCheckedInToday: boolean;
  initialScore: number | null;
}) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(alreadyCheckedInToday);

  async function handlePick(value: number) {
    if (isSubmitting) return;
    setScore(value);
    setIsSubmitting(true);
    const result = await submitMoodCheckin(coupleId, value, note.trim() || null);
    setIsSubmitting(false);
    if (result.ok) setDone(true);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper2 p-5">
      <p className="font-sans text-xs text-ink/70">how are you feeling today?</p>
      <div className="flex justify-between gap-1">
        {FACES.map((face, index) => {
          const value = index + 1;
          const isSelected = score === value;
          return (
            <motion.button
              key={value}
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              type="button"
              onClick={() => handlePick(value)}
              disabled={isSubmitting}
              aria-label={FACE_LABELS[index]}
              aria-pressed={isSelected}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
                isSelected ? "bg-ember/20" : "opacity-50"
              }`}
            >
              {face}
            </motion.button>
          );
        })}
      </div>
      {!done && (
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="add a note (optional)"
          aria-label="mood note"
          className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-xs text-ink outline-none focus:border-ember"
        />
      )}
      {done && <p className="font-sans text-xs text-ink">checked in for today.</p>}
    </div>
  );
}
