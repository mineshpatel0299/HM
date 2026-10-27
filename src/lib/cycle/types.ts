export const SYMPTOMS = [
  "Cramps",
  "Fatigue",
  "Bloating",
  "Headache",
  "Tender breasts",
  "Mood changes",
  "Backache",
  "Feeling good",
] as const;
export type Symptom = (typeof SYMPTOMS)[number];
export type PeriodEntry = {
  id: string;
  startDate: string;
  endDate: string | null;
  symptoms: Symptom[];
  note: string;
};
export type CycleSettings = { cycleLength: number; periodLength: number };
export type CycleState = {
  settings: CycleSettings;
  entries: PeriodEntry[];
  available: boolean;
};
export type CycleResult = { ok: true } | { ok: false; error: string };
