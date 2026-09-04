"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { dropNote } from "@/lib/jar/actions";

export function JarComposer({
  coupleId,
  onDropped,
}: {
  coupleId: string;
  onDropped: () => void;
}) {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropped, setDropped] = useState(false);

  async function handleDrop() {
    if (!text.trim()) return;
    setIsSaving(true);
    setError(null);
    const result = await dropNote(coupleId, text.trim());
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setText("");
    setDropped(true);
    onDropped();
    window.setTimeout(() => setDropped(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper2 p-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        placeholder="a little love or gratitude note..."
        aria-label="a note for the jar"
        className="rounded-xl border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
      />
      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleDrop}
        disabled={isSaving || !text.trim()}
        className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
      >
        {isSaving ? "dropping…" : "drop it in"}
      </motion.button>
      {dropped && <p className="font-sans text-xs text-ink">in the jar.</p>}
    </div>
  );
}
