"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useMutualReveal } from "@/lib/reveal/useMutualReveal";
import { submitSparkAnswer } from "@/lib/spark/actions";
import { MessageSquareHeart, Send, Lock, Eye } from "lucide-react";

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
    <div className="flex flex-col gap-4 rounded-3xl glass-card p-6 border border-white/80 shadow-glass">
      <div className="flex items-center gap-2">
        <MessageSquareHeart className="h-5 w-5 text-ember" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-ember">
          Daily Spark Prompt
        </span>
      </div>

      <p className="font-display text-xl font-bold text-ink leading-snug">{promptText}</p>

      {mine === null ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Write your honest reflection..."
            className="w-full rounded-2xl glass-input p-4 font-sans text-xs text-ink placeholder:text-ink-muted outline-none"
          />
          <motion.button
            variants={scalePress}
            initial="rest"
            whileTap="tap"
            onClick={handleSubmit}
            disabled={isSubmitting || !draft.trim()}
            className="self-end flex items-center gap-1.5 rounded-2xl gradient-btn px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-md disabled:opacity-50"
          >
            <span>{isSubmitting ? "Submitting..." : "Submit Answer"}</span>
            <Send className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      ) : !bothRevealed ? (
        <div className="flex items-center gap-3 rounded-2xl bg-amber/10 p-4 border border-amber/20 text-amber text-xs font-sans font-medium">
          <Lock className="h-4 w-4 shrink-0 text-amber" />
          <span>You submitted your answer! Waiting for <strong className="text-ink">{partnerName}</strong> to answer to reveal both.</span>
        </div>
      ) : (
        <motion.div
          variants={variants(reveal)}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 pt-2 border-t border-line"
        >
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-emerald-700">
            <Eye className="h-4 w-4 text-emerald-500" />
            <span>Mutual Reveal Unlocked!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/80 p-4 border border-line flex flex-col gap-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ember">You</span>
              <p className="font-sans text-xs text-ink">{mine}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 border border-line flex flex-col gap-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber">{partnerName}</span>
              <p className="font-sans text-xs text-ink">{partner}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
