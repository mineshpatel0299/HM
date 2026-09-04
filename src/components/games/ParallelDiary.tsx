"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useMutualReveal } from "@/lib/reveal/useMutualReveal";
import { submitDiaryEntry } from "@/lib/diary/actions";

// Mirrors the `line` token's exact rgba value. Inline style, not a Tailwind
// arbitrary-value class — Tailwind can't statically detect a class name
// built at runtime, so a template-interpolated `bg-[...]` here would
// silently produce no CSS. A lined-paper texture, distinct from
// SparkCard's plain JournalCard so the two mutual-reveal features don't
// feel redundant.
const LINED_PAPER_BG =
  "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(36,25,52,0.14) 28px)";

export function ParallelDiary({
  coupleId,
  myId,
  partnerName,
  entryDate,
  dateLabel,
  initialMine,
  initialPartner,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  entryDate: string;
  dateLabel: string;
  initialMine: string | null;
  initialPartner: string | null;
}) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mine, partner, bothRevealed, setMine } = useMutualReveal(
    "diary:submitted",
    entryDate,
    myId,
    initialMine,
    initialPartner,
  );
  const { variants } = useReducedMotionSafe();

  async function handleSubmit() {
    if (!draft.trim()) return;
    setIsSubmitting(true);
    const result = await submitDiaryEntry(coupleId, entryDate, draft.trim());
    setIsSubmitting(false);
    if (result.ok) setMine(draft.trim());
  }

  return (
    <div
      className="rounded-2xl border border-line bg-paper2 p-6"
      style={{ backgroundImage: LINED_PAPER_BG }}
    >
      <p className="font-sans text-xs text-ink/70">parallel diary — {dateLabel}</p>
      <p className="mb-3 font-display text-lg text-ink">what was today like for you?</p>

      {mine === null ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            placeholder="write freely..."
            aria-label="today's diary entry"
            className="rounded-xl border border-line bg-paper/70 px-3 py-2 font-sans text-sm leading-7 text-ink outline-none focus:border-ember"
          />
          <motion.button
            variants={scalePress}
            initial="rest"
            whileTap="tap"
            onClick={handleSubmit}
            disabled={isSubmitting || !draft.trim()}
            className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
          >
            {isSubmitting ? "sending…" : "write it down"}
          </motion.button>
        </div>
      ) : !bothRevealed ? (
        <p className="font-sans text-sm text-ink/70">
          written — unlocks once {partnerName} writes theirs too.
        </p>
      ) : (
        <motion.div
          variants={variants(reveal)}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          <div>
            <p className="font-sans text-xs text-ink/70">you</p>
            <p className="whitespace-pre-wrap font-sans text-sm leading-7 text-ink">{mine}</p>
          </div>
          <div>
            <p className="font-sans text-xs text-ink/70">{partnerName}</p>
            <p className="whitespace-pre-wrap font-sans text-sm leading-7 text-ink">{partner}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
