"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { flyInSettle, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { scheduleNote } from "@/lib/scheduledNotes/actions";
import type { ScheduledNote } from "@/lib/scheduledNotes/types";

function Composer({ coupleId, onScheduled }: { coupleId: string; onScheduled: () => void }) {
  const [text, setText] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);

  async function handleSchedule() {
    if (!text.trim() || !sendAt) return;
    setIsSaving(true);
    setError(null);
    const result = await scheduleNote(coupleId, text.trim(), new Date(sendAt).toISOString());
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setText("");
    setSendAt("");
    setScheduled(true);
    onScheduled();
    window.setTimeout(() => setScheduled(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper2 p-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        placeholder="write a note to arrive later..."
        aria-label="scheduled note"
        className="rounded-xl border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
      />
      <input
        type="datetime-local"
        value={sendAt}
        onChange={(event) => setSendAt(event.target.value)}
        aria-label="send at"
        className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-xs text-ink outline-none focus:border-ember"
      />
      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleSchedule}
        disabled={isSaving || !text.trim() || !sendAt}
        className="self-start rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
      >
        {isSaving ? "scheduling…" : "schedule it"}
      </motion.button>
      {scheduled && <p className="font-sans text-xs text-ink">on its way, later.</p>}
    </div>
  );
}

export function ScheduledNotes({
  coupleId,
  myId,
  partnerName,
  initialNotes,
}: {
  coupleId: string;
  myId: string;
  partnerName: string;
  initialNotes: ScheduledNote[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [toast, setToast] = useState<ScheduledNote | null>(null);
  const { variants } = useReducedMotionSafe();

  useRealtimeEvent<ScheduledNote>("note:delivered", (event) => {
    if (event.coupleId !== coupleId || event.toId !== myId) return;
    setNotes((prev) => [event, ...prev]);
    setToast(event);
    window.setTimeout(() => setToast(null), 5000);
  });

  return (
    <div className="flex flex-col gap-4">
      <Composer coupleId={coupleId} onScheduled={() => {}} />

      {notes.length === 0 ? (
        <p className="font-sans text-sm text-ink/70">nothing&apos;s arrived yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-line bg-paper2 px-4 py-3">
              <p className="whitespace-pre-wrap font-sans text-sm text-ink">{note.text}</p>
              <p className="mt-1 font-sans text-xs text-ink/70">
                from {partnerName} — {new Date(note.sendAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            variants={variants(flyInSettle)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6"
          >
            <div className="pointer-events-auto max-w-xs rounded-2xl bg-ink px-4 py-3 text-center shadow-sm">
              <p className="font-sans text-xs text-paper/60">a note just arrived from {partnerName}</p>
              <p className="mt-1 font-sans text-sm text-paper">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
