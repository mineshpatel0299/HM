"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { postMoment } from "@/lib/moments/actions";
import { MOOD_TAGS, type MomentEvent } from "@/lib/moments/types";

export function MomentComposer({
  coupleId,
  myId,
  onPosted,
}: {
  coupleId: string;
  myId: string;
  onPosted: (moment: MomentEvent) => void;
}) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePost() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsPosting(true);
    setError(null);

    // Optimistic: shows immediately with a client-side id, before the
    // server confirms. MomentsBoard ignores the eventual broadcast for
    // this same post (authorId === myId) so it doesn't get duplicated.
    onPosted({
      id: `optimistic-${Date.now()}`,
      coupleId,
      authorId: myId,
      text: trimmed,
      mood,
      createdAt: new Date().toISOString(),
    });
    setText("");
    setMood(null);

    const result = await postMoment(coupleId, trimmed, mood);
    setIsPosting(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper2 p-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        placeholder="what's a moment from today?"
        aria-label="a moment from today"
        className="rounded-xl border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
      />
      <div className="flex flex-wrap gap-1">
        {MOOD_TAGS.map((tag) => (
          <button
            key={tag.value}
            type="button"
            onClick={() => setMood((current) => (current === tag.value ? null : tag.value))}
            className={`rounded-full border px-2 py-1 font-sans text-xs ${
              mood === tag.value ? "border-ember bg-emberDark text-paper" : "border-line text-ink/70"
            }`}
          >
            {tag.emoji} {tag.label}
          </button>
        ))}
      </div>
      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        onClick={handlePost}
        disabled={isPosting || !text.trim()}
        className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
      >
        post
      </motion.button>
    </div>
  );
}
