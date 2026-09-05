"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { updateCoupleDate, type CoupleDateField, type CoupleDatesUpdatedEvent } from "@/lib/couples/actions";
import { Heart, Plane, Edit2, Check } from "lucide-react";

function computeDisplay(field: CoupleDateField, value: string | null): { big: string; small: string } {
  if (!value) return { big: "—", small: "not set yet" };
  const target = parseISO(value);
  const today = new Date();
  if (field === "sinceDate") {
    const days = Math.max(differenceInCalendarDays(today, target) + 1, 1);
    return { big: String(days), small: "Days of love" };
  }
  const days = differenceInCalendarDays(target, today);
  if (days < 0) return { big: "—", small: "Date passed" };
  if (days === 0) return { big: "Today!", small: "Reunion is here 🎉" };
  return { big: String(days), small: "Days to reunion" };
}

export function StatCard({
  coupleId,
  field,
  label,
  initialValue,
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
  const isSince = field === "sinceDate";
  const Icon = isSince ? Heart : Plane;

  return (
    <div className="relative flex flex-col justify-between gap-3 rounded-3xl glass-card glass-card-hover p-5 border border-white/80 shadow-glass overflow-hidden group">
      {/* Decorative ambient background glow */}
      <div
        className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 ${
          isSince ? "bg-ember/20" : "bg-amber/20"
        }`}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
              isSince ? "bg-ember/10 text-ember" : "bg-amber/10 text-amber"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink-muted">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          aria-label={`Edit ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-paper2/80 text-ink-muted hover:text-ember transition-colors border border-line"
        >
          <Edit2 className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-col gap-0.5 my-1">
        <motion.p
          key={display.big}
          variants={variants(reveal)}
          initial="hidden"
          animate="visible"
          className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink"
        >
          {display.big}
        </motion.p>
        <span className="font-sans text-xs font-semibold text-ink-muted">{display.small}</span>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-2 pt-2 border-t border-line"
        >
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label={label}
              className="flex-1 rounded-xl glass-input px-3 py-1.5 font-sans text-xs text-ink outline-none"
            />
            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl gradient-btn px-3 py-1.5 font-sans text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              <span>Save</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
