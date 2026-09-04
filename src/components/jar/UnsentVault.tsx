"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { writeUnsentMessage, revealNow } from "@/lib/unsent/actions";
import type { UnsentMessage, UnsentVisibility } from "@/lib/unsent/types";

const VISIBILITY_OPTIONS: { value: UnsentVisibility; label: string }[] = [
  { value: "private", label: "just for me" },
  { value: "unlock_on_date", label: "unlock on a date" },
  { value: "unlock_on_read_request", label: "let them read it, my call, later" },
];

function Composer({
  coupleId,
  onWritten,
}: {
  coupleId: string;
  onWritten: (message: UnsentMessage) => void;
}) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<UnsentVisibility>("private");
  const [unlockDate, setUnlockDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!text.trim()) return;
    setIsSaving(true);
    setError(null);

    const unlockAtIso =
      visibility === "unlock_on_date" && unlockDate
        ? new Date(`${unlockDate}T12:00:00`).toISOString()
        : null;
    const result = await writeUnsentMessage(coupleId, text.trim(), visibility, unlockAtIso);
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    onWritten({
      id: `pending-${Date.now()}`,
      coupleId,
      authorId: "",
      text: text.trim(),
      visibility,
      unlockAt: unlockAtIso,
      revealed: false,
      createdAt: new Date().toISOString(),
    });
    setText("");
    setVisibility("private");
    setUnlockDate("");
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper2 p-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder="write freely — this stays yours unless you say otherwise..."
        aria-label="unsent message"
        className="rounded-xl border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
      />
      <div className="flex flex-col gap-1">
        {VISIBILITY_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 font-sans text-xs text-ink/70">
            <input
              type="radio"
              name="visibility"
              checked={visibility === option.value}
              onChange={() => setVisibility(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {visibility === "unlock_on_date" && (
        <input
          type="date"
          value={unlockDate}
          onChange={(event) => setUnlockDate(event.target.value)}
          aria-label="unlock date"
          className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-xs text-ink outline-none focus:border-ember"
        />
      )}
      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleSave}
        disabled={isSaving || !text.trim() || (visibility === "unlock_on_date" && !unlockDate)}
        className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
      >
        {isSaving ? "writing…" : "keep it"}
      </motion.button>
    </div>
  );
}

function MyEntry({
  coupleId,
  message,
  onRevealed,
}: {
  coupleId: string;
  message: UnsentMessage;
  onRevealed: () => void;
}) {
  const [isRevealing, setIsRevealing] = useState(false);
  const canReveal = message.visibility !== "private" && !message.revealed;

  async function handleReveal() {
    setIsRevealing(true);
    const result = await revealNow(coupleId, message.id);
    setIsRevealing(false);
    if (result.ok) onRevealed();
  }

  return (
    <div className="rounded-xl border border-dashed border-line bg-paper2 px-4 py-3">
      <p className="whitespace-pre-wrap font-sans text-sm text-ink">{message.text}</p>
      <div className="mt-2 flex items-center gap-2 font-sans text-xs text-ink/70">
        <span>
          {message.visibility === "private"
            ? "just for you"
            : message.revealed
              ? "shared"
              : message.visibility === "unlock_on_date"
                ? `unlocks ${message.unlockAt ? new Date(message.unlockAt).toLocaleDateString() : ""}`
                : "not shared yet"}
        </span>
        {canReveal && (
          <button
            type="button"
            onClick={handleReveal}
            disabled={isRevealing}
            className="ml-auto underline underline-offset-4"
          >
            {isRevealing ? "sharing…" : "let them read this now"}
          </button>
        )}
      </div>
    </div>
  );
}

export function UnsentVault({
  coupleId,
  partnerName,
  initialMine,
  initialFromPartner,
}: {
  coupleId: string;
  partnerName: string;
  initialMine: UnsentMessage[];
  initialFromPartner: UnsentMessage[];
}) {
  const [mine, setMine] = useState(initialMine);
  const [fromPartner] = useState(initialFromPartner);

  return (
    <div className="flex flex-col gap-4">
      <Composer coupleId={coupleId} onWritten={(message) => setMine((prev) => [message, ...prev])} />

      {mine.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-sans text-xs text-ink/70">yours</p>
          {mine.map((message) => (
            <MyEntry
              key={message.id}
              coupleId={coupleId}
              message={message}
              onRevealed={() =>
                setMine((prev) =>
                  prev.map((m) => (m.id === message.id ? { ...m, revealed: true } : m)),
                )
              }
            />
          ))}
        </div>
      )}

      {fromPartner.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-sans text-xs text-ink/70">from {partnerName}</p>
          {fromPartner.map((message) => (
            <div key={message.id} className="rounded-xl border border-line bg-paper2 px-4 py-3">
              <p className="whitespace-pre-wrap font-sans text-sm text-ink">{message.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
