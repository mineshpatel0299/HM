"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { JournalCard } from "@/components/ui/JournalCard";
import { updateCoupleDate, type CoupleDateField, type CoupleDatesUpdatedEvent } from "@/lib/couples/actions";

function computeDisplay(field: CoupleDateField, value: string | null): { big: string; small: string } {
  if (!value) return { big: "—", small: "not set yet" };
  const target = parseISO(value);
  const today = new Date();
  if (field === "sinceDate") {
    const days = Math.max(differenceInCalendarDays(today, target) + 1, 1);
    return { big: String(days), small: "days together" };
  }
  const days = differenceInCalendarDays(target, today);
  if (days < 0) return { big: "—", small: "date's passed" };
  if (days === 0) return { big: "today", small: "the visit is here" };
  return { big: String(days), small: "days to go" };
}

export function StatCard({
  coupleId,
  field,
  label,
  initialValue,
  rotation = 0,
}: {
  coupleId: string;
  field: CoupleDateField;
  label: string;
  initialValue: string | null;
  rotation?: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const { variants } = useReducedMotionSafe();

  useRealtimeEvent<CoupleDatesUpdatedEvent>("couple:datesUpdated", (event) => {
    if (event.field !== field) return;
    setValue(event.value);
  });

  async function handleSave() {
    setIsSaving(true);
    const result = await updateCoupleDate(coupleId, field, draft || null);
    setIsSaving(false);
    if (result.ok) {
      setValue(draft || null);
      setIsEditing(false);
    }
  }

  const display = computeDisplay(field, value);

  return (
    <JournalCard corner="c" rotation={rotation} animateIn={false} className="flex flex-col gap-1">
      <p className="font-sans text-xs text-ink/70">{label}</p>
      <motion.p
        key={display.big}
        variants={variants(reveal)}
        initial="hidden"
        animate="visible"
        className="font-display text-3xl text-ink"
      >
        {display.big}
      </motion.p>
      <p className="font-sans text-xs text-ink/70">{display.small}</p>

      {isEditing ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={label}
            className="rounded-lg border border-line bg-paper px-2 py-1 font-sans text-xs text-ink outline-none focus:border-ember"
          />
          <motion.button
            variants={scalePress}
            initial="rest"
            whileTap="tap"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-emberDark px-3 py-1 font-sans text-xs text-paper disabled:opacity-50"
          >
            save
          </motion.button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="mt-2 self-start font-sans text-xs text-ink/70 underline underline-offset-4"
        >
          edit
        </button>
      )}
    </JournalCard>
  );
}
