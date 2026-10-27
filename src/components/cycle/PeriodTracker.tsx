"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
} from "date-fns";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flower2,
  Heart,
  LockKeyhole,
  Plus,
  Settings2,
  Trash2,
  X,
  Pencil,
  CalendarDays,
} from "lucide-react";
import { calendarDayKind, cycleSummary } from "@/lib/cycle/dates";
import {
  deletePeriod,
  saveCycleSettings,
  savePeriod,
} from "@/lib/cycle/actions";
import {
  SYMPTOMS,
  type CycleState,
  type PeriodEntry,
  type Symptom,
} from "@/lib/cycle/types";

type Editor =
  | { kind: "period"; entry?: PeriodEntry }
  | { kind: "settings" }
  | { kind: "delete"; entry: PeriodEntry }
  | null;

export function PeriodTracker({
  initialState,
  today,
}: {
  initialState: CycleState;
  today: string;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(() => startOfMonth(parseISO(today)));
  const [selected, setSelected] = useState(today);
  const [editor, setEditor] = useState<Editor>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [pending, startTransition] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  const { entries, settings, available } = initialState;
  const summary = cycleSummary(entries, settings, today);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const selectedEntry = entries.find(
    (entry) =>
      selected >= entry.startDate && selected <= (entry.endDate ?? today),
  );

  useEffect(() => {
    if (editor) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [editor]);

  function openEditor(next: Editor) {
    setError("");
    setNotice("");
    setSymptoms(next?.kind === "period" ? (next.entry?.symptoms ?? []) : []);
    setEditor(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      const result =
        editor?.kind === "settings"
          ? await saveCycleSettings({
              cycleLength: Number(data.get("cycleLength")),
              periodLength: Number(data.get("periodLength")),
            })
          : editor?.kind === "delete"
            ? await deletePeriod(editor.entry.id)
            : await savePeriod({
                id:
                  editor?.kind === "period"
                    ? editor.entry?.id || undefined
                    : undefined,
                startDate: String(data.get("startDate")),
                endDate: String(data.get("endDate") || "") || null,
                symptoms,
                note: String(data.get("note") ?? ""),
              });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(
        editor?.kind === "delete"
          ? "Entry deleted."
          : "Your changes are saved.",
      );
      setEditor(null);
      router.refresh();
    });
  }

  return (
    <>
      {!available && (
        <div
          role="status"
          className="rounded-2xl border border-amber/20 bg-amber/5 px-5 py-4 text-xs leading-relaxed text-ink-muted"
        >
          Your tracker is almost ready. Saving will be available once setup is
          complete.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11px] text-ink-muted">
          <LockKeyhole size={13} className="text-sage" />
          Only you can see your cycle entries
        </span>
        <button
          className="secondary-button"
          disabled={!available}
          onClick={() => openEditor({ kind: "settings" })}
        >
          <Settings2 size={14} />
          Cycle preferences
        </button>
      </div>
      {notice && (
        <p role="status" className="flex items-center gap-2 text-xs text-sage">
          <Check size={14} />
          {notice}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <section className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-[#e9d6dc] bg-[#f2e5e9] px-6 py-7 text-center sm:px-8">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-ember/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full border border-ember/10"
          />
          <div className="relative flex w-full items-center justify-between">
            <span className="eyebrow text-emberDark">
              Your cycle, at a glance
            </span>
            <Flower2 size={19} strokeWidth={1.3} className="text-ember" />
          </div>
          <div className="relative my-7 aspect-square w-[220px] max-w-full shrink-0">
            <svg
              viewBox="0 0 220 220"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full -rotate-90"
            >
              <circle
                cx="110"
                cy="110"
                r="98"
                fill="none"
                stroke="#e5cdd5"
                strokeWidth="7"
              />
              <circle
                cx="110"
                cy="110"
                r="98"
                fill="none"
                stroke="#a54f68"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${(summary?.progress ?? 0.03) * 615.75} 615.75`}
              />
            </svg>
            <div className="absolute inset-[18%] flex min-w-0 flex-col items-center justify-center gap-1 text-center">
              <Droplets
                size={18}
                strokeWidth={1.5}
                className="shrink-0 text-ember"
              />
              <span className="max-w-full text-[9px] uppercase leading-4 tracking-[.12em] text-emberDark">
                {summary ? "Cycle day" : "Your next chapter"}
              </span>
              <span className="max-w-full font-display text-[52px] leading-none tracking-tight text-emberDark tabular-nums">
                {summary?.day ?? "—"}
              </span>
              <span className="max-w-[132px] text-balance text-[11px] leading-4 text-emberDark/80">
                {summary
                  ? summary.onPeriod
                    ? "Period logged"
                    : "Between periods"
                  : "Start with a little check-in"}
              </span>
            </div>
          </div>
          <h2 className="font-display text-2xl text-emberDark">
            {!summary
              ? "Get to know your rhythm"
              : summary.daysUntil < 0
                ? "Time for a fresh check-in"
                : summary.daysUntil === 0
                  ? "Your period may start today"
                  : `Next period in ~${summary.daysUntil} days`}
          </h2>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-emberDark/75">
            {!summary
              ? "Log your last period to see a personal estimate of what comes next."
              : summary.daysUntil < 0
                ? `Your last estimate was ${format(parseISO(summary.nextDate), "MMM d")}. Log an update whenever you’re ready.`
                : `Estimated around ${format(parseISO(summary.nextDate), "MMMM d")}, based on your ${settings.cycleLength}-day cycle.`}
          </p>
          <button
            disabled={!available}
            className="primary-button relative mt-6 w-full max-w-xs"
            onClick={() => openEditor({ kind: "period" })}
          >
            <Plus size={16} />
            Log a period
            <ArrowRight size={14} className="ml-auto" />
          </button>
          <p className="mt-4 text-[10px] text-emberDark/70">
            A little awareness. A little more care.
          </p>
        </section>

        <section
          className="premium-card p-5 sm:p-7"
          aria-label="Period calendar"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1.5">Your calendar</p>
              <h2 aria-live="polite" className="font-display text-2xl">
                {format(month, "MMMM yyyy")}
              </h2>
            </div>
            <div className="flex gap-1">
              <button
                aria-label="Previous month"
                className="secondary-button !min-h-9 !px-2.5"
                onClick={() => setMonth(addMonths(month, -1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Next month"
                className="secondary-button !min-h-9 !px-2.5"
                onClick={() => setMonth(addMonths(month, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="pb-3 text-[10px] font-medium text-ink-muted"
              >
                {label}
              </span>
            ))}
            {days.map((date) => {
              const key = format(date, "yyyy-MM-dd");
              const kind = calendarDayKind(key, entries, settings, today);
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  aria-label={`${format(date, "EEEE, MMMM d, yyyy")}${kind === "logged" ? ", recorded period" : kind === "predicted" ? ", estimated period" : ""}`}
                  aria-pressed={selected === key}
                  aria-current={key === today ? "date" : undefined}
                  className={`relative mx-auto flex aspect-square min-h-9 w-full max-w-11 items-center justify-center rounded-full border text-xs transition-colors ${kind === "logged" ? "border-ember bg-ember text-white" : kind === "predicted" ? "border-dashed border-ember/50 bg-ember/5 text-emberDark" : "border-transparent hover:bg-paper2"} ${!isSameMonth(date, month) ? "opacity-35" : ""} ${selected === key ? "ring-2 ring-ember/40 ring-offset-2" : ""} ${key === today ? "font-bold" : ""}`}
                >
                  {format(date, "d")}
                  {key === today && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1 h-1 w-1 rounded-full ${kind === "logged" ? "bg-white" : "bg-ember"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-line pt-4 text-[10px] text-ink-muted">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-ember" />
              Recorded period
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-ember bg-ember/5" />
              Estimated period
            </span>
            <button
              className="ml-auto text-ember hover:underline"
              onClick={() => {
                setMonth(startOfMonth(parseISO(today)));
                setSelected(today);
              }}
            >
              Today
            </button>
          </div>
          <div className="mt-5 rounded-2xl bg-paper p-4">
            <p className="text-xs font-medium">
              {format(parseISO(selected), "EEEE, MMMM d")}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              {selectedEntry
                ? `${selectedEntry.symptoms.length ? selectedEntry.symptoms.join(" · ") : "Period recorded"}${selectedEntry.note ? ` — ${selectedEntry.note}` : ""}`
                : calendarDayKind(selected, entries, settings, today) ===
                    "predicted"
                  ? "Estimated period day. Your actual dates may vary."
                  : "A little space to listen to your body."}
            </p>
            {selected <= today && (
              <button
                disabled={!available}
                className="mt-3 flex items-center gap-1 text-[11px] font-medium text-ember disabled:opacity-50"
                onClick={() =>
                  openEditor({
                    kind: "period",
                    entry: selectedEntry ?? {
                      id: "",
                      startDate: selected,
                      endDate: null,
                      symptoms: [],
                      note: "",
                    },
                  })
                }
              >
                {selectedEntry ? "Edit this entry" : "Log a period here"}
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="premium-card p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-2">Your personal journal</p>
              <h2 className="font-display text-2xl">Cycle history</h2>
            </div>
            <span className="rounded-full bg-paper px-3 py-1.5 text-[10px] text-ink-muted">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-5 py-9 text-center">
              <CalendarDays
                size={25}
                strokeWidth={1.2}
                className="mb-4 text-ember/70"
              />
              <p className="font-display text-lg">
                Your story starts with one entry
              </p>
              <p className="mt-2 max-w-xs text-[11px] leading-relaxed text-ink-muted">
                Add your most recent period, then build a picture of your
                personal rhythm over time.
              </p>
            </div>
          ) : (
            <div className="max-h-[440px] overflow-y-auto">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="flex items-start gap-3 border-t border-line py-4 first:border-0 first:pt-0"
                >
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ember/10 text-ember">
                    <Droplets size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">
                      {format(parseISO(entry.startDate), "MMM d, yyyy")}{" "}
                      <span className="text-ink-muted">
                        —{" "}
                        {entry.endDate
                          ? format(parseISO(entry.endDate), "MMM d, yyyy")
                          : "Ongoing"}
                      </span>
                    </p>
                    <p className="mt-1.5 text-[10px] text-ink-muted">
                      {entry.endDate
                        ? `${differenceInCalendarDays(parseISO(entry.endDate), parseISO(entry.startDate)) + 1} days`
                        : "End date not recorded"}
                      {entry.symptoms.length
                        ? ` · ${entry.symptoms.join(" · ")}`
                        : ""}
                    </p>
                    {entry.note && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-ink-muted">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <button
                    className="rounded-lg p-2 text-ink-muted hover:bg-paper hover:text-ember"
                    aria-label={`Edit period starting ${entry.startDate}`}
                    onClick={() => openEditor({ kind: "period", entry })}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="rounded-lg p-2 text-ink-muted hover:bg-paper hover:text-ember"
                    aria-label={`Delete period starting ${entry.startDate}`}
                    onClick={() => openEditor({ kind: "delete", entry })}
                  >
                    <Trash2 size={13} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-5">
          <div className="premium-card p-6">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-sage/10 text-sage">
              <Heart size={18} strokeWidth={1.4} />
            </span>
            <p className="eyebrow mb-2">A softer reminder</p>
            <h2 className="font-display text-2xl leading-snug">
              Make a little room
              <br />
              for <em>yourself.</em>
            </h2>
            <p className="mt-3 text-xs leading-6 text-ink-muted">
              Every cycle is personal. A check-in can be as simple as noting how
              you feel, resting, or asking for a little extra care.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-5 py-4">
            <span className="text-[11px] text-ink-muted">Your preferences</span>
            <span className="text-[11px] font-medium">
              {settings.cycleLength}-day cycle · {settings.periodLength}-day
              period
            </span>
          </div>
        </aside>
      </div>
      <p className="text-center text-[10px] leading-relaxed text-ink-muted">
        Estimates use the cycle length you set and your latest period. Cycles
        can vary. This tracker is not for contraception or diagnosis.
      </p>

      <dialog
        ref={dialog}
        aria-labelledby="cycle-dialog-title"
        onCancel={(event) => {
          if (pending) event.preventDefault();
          else setEditor(null);
        }}
        onClose={() => {
          if (!pending) setEditor(null);
        }}
        className="max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-line bg-white p-5 text-ink shadow-2xl sm:p-8"
      >
        {editor && (
          <form onSubmit={submit} className="flex min-w-0 flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow mb-2 text-ember">Just for you</p>
                <h2 id="cycle-dialog-title" className="font-display text-2xl">
                  {editor.kind === "settings"
                    ? "Your cycle preferences"
                    : editor.kind === "delete"
                      ? "Delete this entry?"
                      : editor.entry?.id
                        ? "Edit your period"
                        : "Log your period"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                disabled={pending}
                className="shrink-0 rounded-full p-2 text-ink-muted hover:bg-paper"
                onClick={() => setEditor(null)}
              >
                <X size={18} />
              </button>
            </div>
            {editor.kind === "settings" ? (
              <>
                <p className="text-xs leading-relaxed text-ink-muted">
                  Use your usual lengths to personalize estimates. You can
                  update these whenever your rhythm changes.
                </p>
                <label className="grid min-w-0 gap-2 text-xs font-medium">
                  Cycle length (days)
                  <input
                    className="field min-w-0 max-w-full"
                    name="cycleLength"
                    type="number"
                    min="15"
                    max="90"
                    required
                    defaultValue={settings.cycleLength}
                  />
                </label>
                <label className="grid min-w-0 gap-2 text-xs font-medium">
                  Period length (days)
                  <input
                    className="field min-w-0 max-w-full"
                    name="periodLength"
                    type="number"
                    min="1"
                    max="20"
                    required
                    defaultValue={settings.periodLength}
                  />
                </label>
              </>
            ) : editor.kind === "delete" ? (
              <p className="text-xs leading-relaxed text-ink-muted">
                The period starting{" "}
                {format(parseISO(editor.entry.startDate), "MMMM d, yyyy")} and
                its notes will be removed. This cannot be undone.
              </p>
            ) : (
              <>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2 text-xs font-medium">
                    Start date
                    <input
                      className="field min-w-0 max-w-full !px-2.5"
                      name="startDate"
                      type="date"
                      max={today}
                      required
                      defaultValue={editor.entry?.startDate ?? today}
                    />
                  </label>
                  <label className="grid min-w-0 gap-2 text-xs font-medium">
                    <span>
                      End date{" "}
                      <span className="font-normal text-ink-muted">
                        (optional)
                      </span>
                    </span>
                    <input
                      className="field min-w-0 max-w-full !px-2.5"
                      name="endDate"
                      type="date"
                      max={today}
                      defaultValue={editor.entry?.endDate ?? ""}
                    />
                  </label>
                </div>
                <p className="-mt-2 text-[10px] leading-relaxed text-ink-muted">
                  Leave the end date blank if your period is ongoing.
                </p>
                <fieldset className="min-w-0">
                  <legend className="mb-3 text-xs font-medium">
                    How are you feeling?
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        aria-pressed={symptoms.includes(symptom)}
                        onClick={() =>
                          setSymptoms((prev) =>
                            prev.includes(symptom)
                              ? prev.filter((s) => s !== symptom)
                              : [...prev, symptom],
                          )
                        }
                        className={`min-h-9 rounded-full border px-3 text-[11px] transition-colors ${symptoms.includes(symptom) ? "border-ember/30 bg-ember/10 text-emberDark" : "border-line text-ink-muted hover:bg-paper"}`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="grid min-w-0 gap-2 text-xs font-medium">
                  A note to yourself{" "}
                  <textarea
                    name="note"
                    maxLength={1000}
                    rows={3}
                    defaultValue={editor.entry?.note ?? ""}
                    placeholder="Anything you’d like to remember…"
                    className="field min-w-0 max-w-full resize-y"
                  />
                </label>
              </>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-ember/10 p-3 text-xs text-emberDark"
              >
                {error}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
              <button
                type="button"
                className="secondary-button"
                disabled={pending}
                onClick={() => setEditor(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={pending}
              >
                {pending
                  ? "Saving…"
                  : editor.kind === "delete"
                    ? "Delete entry"
                    : "Save changes"}
                {!pending && <Check size={14} />}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
