"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useMutualReveal } from "@/lib/reveal/useMutualReveal";
import { submitSparkAnswer } from "@/lib/spark/actions";
import { JournalCard } from "@/components/ui/JournalCard";

export function SparkCard({
  coupleId,
  myId,
  partnerName,
  promptId,
  promptText,
  initialMine,
  initialPartner,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  promptId: string;
  promptText: string;
  initialMine: string | null;
  initialPartner: string | null;
}) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mine, partner, bothRevealed, setMine } = useMutualReveal(
    "spark:submitted",
    promptId,
    myId,
    initialMine,
    initialPartner,
  );
  const { variants } = useReducedMotionSafe();

  async function handleSubmit() {
    if (!draft.trim()) return;
    setIsSubmitting(true);
    const result = await submitSparkAnswer(coupleId, promptId, draft.trim());
    setIsSubmitting(false);
    if (result.ok) setMine(draft.trim());
  }

  return (
    <JournalCard corner="a" animateIn={false} className="flex flex-col gap-4">
      <p className="font-sans text-xs text-ink/70">today&apos;s spark</p>
      <p className="font-display text-xl text-ink">{promptText}</p>

      {mine === null ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="your answer..."
            className="rounded-xl border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
          />
          <motion.button
            variants={scalePress}
            initial="rest"
            whileTap="tap"
            onClick={handleSubmit}
            disabled={isSubmitting || !draft.trim()}
            className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
          >
            {isSubmitting ? "sending…" : "answer"}
          </motion.button>
        </div>
      ) : !bothRevealed ? (
        <p className="font-sans text-sm text-ink/70">
          you answered — waiting on {partnerName}…
        </p>
      ) : (
        <motion.div
          variants={variants(reveal)}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          <div>
            <p className="font-sans text-xs text-ink/70">you</p>
            <p className="font-sans text-sm text-ink">{mine}</p>
          </div>
          <div>
            <p className="font-sans text-xs text-ink/70">{partnerName}</p>
            <p className="font-sans text-sm text-ink">{partner}</p>
          </div>
        </motion.div>
      )}
    </JournalCard>
  );
}
