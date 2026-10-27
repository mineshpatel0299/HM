import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
} from "date-fns";
import type { CycleSettings, PeriodEntry } from "./types";

export function validDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value;
}

/** Calendar-day arithmetic intentionally avoids elapsed milliseconds and DST drift. */
export function cycleSummary(
  entries: PeriodEntry[],
  settings: CycleSettings,
  today: string,
) {
  const latest = [...entries]
    .filter((entry) => entry.startDate <= today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  if (!latest) return null;
  const elapsed = differenceInCalendarDays(
    parseISO(today),
    parseISO(latest.startDate),
  );
  const nextDate = format(
    addDays(parseISO(latest.startDate), settings.cycleLength),
    "yyyy-MM-dd",
  );
  const daysUntil = differenceInCalendarDays(
    parseISO(nextDate),
    parseISO(today),
  );
  return {
    latest,
    day: elapsed + 1,
    nextDate,
    daysUntil,
    progress: Math.min((elapsed + 1) / settings.cycleLength, 1),
    onPeriod: today >= latest.startDate && today <= (latest.endDate ?? today),
  };
}

export function calendarDayKind(
  day: string,
  entries: PeriodEntry[],
  settings: CycleSettings,
  today: string,
): "logged" | "predicted" | null {
  if (
    entries.some(
      (entry) => day >= entry.startDate && day <= (entry.endDate ?? today),
    )
  )
    return "logged";
  const summary = cycleSummary(entries, settings, today);
  if (!summary || summary.daysUntil < 0) return null;
  const predictedEnd = format(
    addDays(parseISO(summary.nextDate), settings.periodLength - 1),
    "yyyy-MM-dd",
  );
  return day >= summary.nextDate && day <= predictedEnd ? "predicted" : null;
}
