"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { JournalCard } from "@/components/ui/JournalCard";
import { openRandomNote } from "@/lib/jar/actions";
import type { JarNote } from "@/lib/jar/types";

export function OpenNoteButton({
  coupleId,
  myId,
  myName,
  partnerName,
  onOpened,
}: {
  coupleId: string;
  myId: string;
  myName: string;
  partnerName: string;
  onOpened: (note: JarNote) => void;
}) {
  const [revealedNote, setRevealedNote] = useState<JarNote | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { variants } = useReducedMotionSafe();

  async function handleOpen() {
    setIsOpening(true);
    setError(null);
    const result = await openRandomNote(coupleId);
    setIsOpening(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevealedNote(result.note);
    onOpened(result.note);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleOpen}
        disabled={isOpening}
        className="rounded-full bg-ink px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
      >
        {isOpening ? "reaching in…" : "open a note"}
      </motion.button>
      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}

      {revealedNote && (
        <motion.div
          key={revealedNote.id}
          variants={variants(reveal)}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <JournalCard corner="b" rotation={-1} animateIn={false}>
            <p className="font-sans text-xs text-ink/70">
              from {revealedNote.authorId === myId ? myName : partnerName}
            </p>
            <p className="mt-2 font-display text-lg text-ink">{revealedNote.text}</p>
          </JournalCard>
        </motion.div>
      )}
    </div>
  );
}
