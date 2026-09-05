"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { reveal, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { updateCoupleDate, type CoupleDateField, type CoupleDatesUpdatedEvent } from "@/lib/couples/actions";
import { Heart, Plane, Edit3, Check, X, Calendar as CalendarIcon } from "lucide-react";

function computeDisplay(field: CoupleDateField, value: string | null): { big: string; small: string; formattedDate: string } {
  if (!value) return { big: "—", small: "Not set yet", formattedDate: "Tap to set date" };
  try {
    const target = parseISO(value);
    if (isNaN(target.getTime())) {
      return { big: "—", small: "Not set yet", formattedDate: "Tap to set date" };
    }
    const today = new Date();
    const formattedDate = format(target, "MMM d, yyyy");

    if (field === "sinceDate") {
      const days = Math.max(differenceInCalendarDays(today, target) + 1, 1);
      return { big: String(days), small: "Days of love", formattedDate };
    }
    const days = differenceInCalendarDays(target, today);
    if (days < 0) return { big: "—", small: "Date passed", formattedDate };
    if (days === 0) return { big: "Today!", small: "Reunion is here 🎉", formattedDate };
    return { big: String(days), small: "Days to reunion", formattedDate };
  } catch {
    return { big: "—", small: "Not set yet", formattedDate: "Tap to set date" };
  }
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
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const { variants } = useReducedMotionSafe();

  useEffect(() => {
    setValue(initialValue);
    setDraft(initialValue ?? "");
  }, [initialValue]);

  useRealtimeEvent<CoupleDatesUpdatedEvent>("couple:datesUpdated", (event) => {
    if (event.field !== field) return;
    setValue(event.value);
    setDraft(event.value ?? "");
  });

  function handleOpenEdit() {
    setDraft(value ?? "");
    setIsEditing(true);
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await updateCoupleDate(coupleId, field, draft || null);
    setIsSaving(false);
    if (result.ok) {
      setValue(draft || null);
      setIsEditing(false);
      router.refresh();
    }
  }

  function handleSetToday() {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    setDraft(todayStr);
  }

  const display = computeDisplay(field, value);
  const isSince = field === "sinceDate";
  const Icon = isSince ? Heart : Plane;

  return (
    <>
      <div className="relative flex flex-col justify-between gap-3 rounded-3xl glass-card glass-card-hover p-5 border border-white/80 shadow-glass overflow-hidden group">
        {/* Ambient background glow */}
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
            onClick={handleOpenEdit}
            aria-label={`Edit ${label}`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper2/90 text-ink hover:text-ember hover:bg-white transition-all border border-line shadow-sm text-xs font-sans font-medium"
          >
            <Edit3 className="h-3 w-3 text-ember" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex flex-col gap-0.5 my-1" onClick={handleOpenEdit} role="button" tabIndex={0}>
          <motion.p
            key={display.big}
            variants={variants(reveal)}
            initial="hidden"
            animate="visible"
            className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink"
          >
            {display.big}
          </motion.p>
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-ink-muted">{display.small}</span>
            <span className="font-sans text-[11px] text-ink-muted/80 flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-md border border-line">
              <CalendarIcon className="h-3 w-3 text-amber" />
              {display.formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Date Edit Modal Overlay */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-white/80 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-ember" />
                  <h3 className="font-display text-lg font-bold text-ink">Edit {label}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full p-1 text-ink-muted hover:bg-paper2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-sans font-semibold text-ink-muted uppercase tracking-wider">
                  Select Date
                </label>
                <input
                  type="date"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="w-full rounded-2xl glass-input px-4 py-3 font-sans text-sm text-ink outline-none border border-line"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="text-xs font-sans font-medium text-ember hover:underline"
                >
                  Set to Today
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl px-4 py-2 text-xs font-sans font-medium text-ink-muted hover:bg-paper2 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    variants={scalePress}
                    initial="rest"
                    whileTap="tap"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl gradient-btn px-5 py-2 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isSaving ? "Saving..." : "Save Date"}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
