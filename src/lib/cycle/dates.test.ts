import { strict as assert } from "node:assert";
import { test } from "node:test";
import { calendarDayKind, cycleSummary, validDateKey } from "./dates";
import type { PeriodEntry } from "./types";

const settings = { cycleLength: 28, periodLength: 5 };
const period = (startDate: string, endDate: string | null): PeriodEntry => ({
  id: startDate,
  startDate,
  endDate,
  symptoms: [],
  note: "",
});

test("date validation rejects impossible dates and malformed input", () => {
  for (const value of [
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "26-01-01",
    "2026-1-01",
    "",
    null,
  ])
    assert.equal(validDateKey(value), false);
  assert.equal(validDateKey("2024-02-29"), true);
});

test("an empty tracker does not invent a cycle", () => {
  assert.equal(cycleSummary([], settings, "2026-10-27"), null);
  assert.equal(calendarDayKind("2026-10-27", [], settings, "2026-10-27"), null);
});

test("cycle starts on day one and derives its next start from preferences", () => {
  const result = cycleSummary(
    [period("2026-10-01", "2026-10-05")],
    settings,
    "2026-10-01",
  )!;
  assert.equal(result.day, 1);
  assert.equal(result.daysUntil, 28);
  assert.equal(result.nextDate, "2026-10-29");
  assert.equal(result.onPeriod, true);
});

test("the most recent past period wins even when entries are unsorted", () => {
  const result = cycleSummary(
    [
      period("2026-09-01", "2026-09-05"),
      period("2026-10-01", "2026-10-05"),
      period("2026-11-01", null),
    ],
    settings,
    "2026-10-27",
  )!;
  assert.equal(result.day, 27);
  assert.equal(result.daysUntil, 2);
  assert.equal(result.onPeriod, false);
});

test("missed estimates stay overdue instead of rolling into an invented cycle", () => {
  const entries = [period("2026-09-01", "2026-09-05")];
  const result = cycleSummary(entries, settings, "2026-10-27")!;
  assert.equal(result.nextDate, "2026-09-29");
  assert.ok(result.daysUntil < 0);
  assert.equal(result.progress, 1);
  assert.equal(
    calendarDayKind("2026-10-27", entries, settings, "2026-10-27"),
    null,
  );
});

test("recorded and estimated ranges include both endpoints", () => {
  const entries = [period("2026-10-01", "2026-10-05")];
  for (const day of ["2026-10-01", "2026-10-05"])
    assert.equal(
      calendarDayKind(day, entries, settings, "2026-10-27"),
      "logged",
    );
  for (const day of ["2026-10-29", "2026-11-02"])
    assert.equal(
      calendarDayKind(day, entries, settings, "2026-10-27"),
      "predicted",
    );
  assert.equal(
    calendarDayKind("2026-11-03", entries, settings, "2026-10-27"),
    null,
  );
});

test("ongoing entries record through today, not future dates", () => {
  const entries = [period("2026-10-25", null)];
  assert.equal(
    calendarDayKind("2026-10-27", entries, settings, "2026-10-27"),
    "logged",
  );
  assert.equal(
    calendarDayKind("2026-10-28", entries, settings, "2026-10-27"),
    null,
  );
});

test("calendar arithmetic stays correct across a daylight saving boundary", () => {
  const result = cycleSummary(
    [period("2026-03-01", "2026-03-05")],
    settings,
    "2026-03-29",
  )!;
  assert.equal(result.day, 29);
  assert.equal(result.daysUntil, 0);
  assert.equal(result.nextDate, "2026-03-29");
});
