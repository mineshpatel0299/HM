"use server";

import { and, eq, gte, lte, or, isNull } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/client";
import { cycleSettings, periodEntries, profiles } from "@/lib/db/schema";
import { validDateKey } from "./dates";
import {
  SYMPTOMS,
  type CycleResult,
  type CycleSettings,
  type PeriodEntry,
} from "./types";

export async function savePeriod(
  input: Omit<PeriodEntry, "id"> & { id?: string },
): Promise<CycleResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in again." };
  const userId = session.user.id;
  try {
    const db = getDb();
    const [profile] = await db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    const today = formatInTimeZone(
      new Date(),
      profile?.timezone ?? "UTC",
      "yyyy-MM-dd",
    );
    if (
      !validDateKey(input.startDate) ||
      input.startDate > today ||
      (input.endDate !== null &&
        (!validDateKey(input.endDate) ||
          input.endDate < input.startDate ||
          input.endDate > today))
    )
      return {
        ok: false,
        error:
          "Choose valid dates up to today. The end must be on or after the start.",
      };
    if (
      typeof input.note !== "string" ||
      input.note.length > 1000 ||
      !Array.isArray(input.symptoms) ||
      input.symptoms.length > SYMPTOMS.length ||
      input.symptoms.some((s) => !SYMPTOMS.includes(s))
    )
      return {
        ok: false,
        error: "Check your symptoms and keep notes under 1,000 characters.",
      };
    if (input.id && !/^[0-9a-f-]{36}$/i.test(input.id))
      return { ok: false, error: "Invalid entry." };
    const overlaps = await db
      .select({ id: periodEntries.id })
      .from(periodEntries)
      .where(
        and(
          eq(periodEntries.profileId, userId),
          lte(periodEntries.startDate, input.endDate ?? "9999-12-31"),
          or(
            isNull(periodEntries.endDate),
            gte(periodEntries.endDate, input.startDate),
          ),
        ),
      );
    if (overlaps.some((row) => row.id !== input.id))
      return {
        ok: false,
        error: "These dates overlap an existing period. Edit that entry first.",
      };
    const values = {
      startDate: input.startDate,
      endDate: input.endDate,
      symptoms: Array.from(new Set(input.symptoms)),
      note: input.note.trim(),
    };
    if (input.id) {
      const rows = await db
        .update(periodEntries)
        .set(values)
        .where(
          and(
            eq(periodEntries.id, input.id),
            eq(periodEntries.profileId, userId),
          ),
        )
        .returning({ id: periodEntries.id });
      if (!rows.length) return { ok: false, error: "Entry not found." };
    } else {
      await db.insert(periodEntries).values({ ...values, profileId: userId });
    }
    revalidatePath("/cycle");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save your entry. Please try again." };
  }
}

export async function saveCycleSettings(
  input: CycleSettings,
): Promise<CycleResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in again." };
  if (
    !Number.isInteger(input.cycleLength) ||
    input.cycleLength < 15 ||
    input.cycleLength > 90 ||
    !Number.isInteger(input.periodLength) ||
    input.periodLength < 1 ||
    input.periodLength > 20 ||
    input.periodLength >= input.cycleLength
  )
    return {
      ok: false,
      error:
        "Use a cycle of 15–90 days and a period of 1–20 days, shorter than your cycle.",
    };
  try {
    const values = {
      cycleLength: input.cycleLength,
      periodLength: input.periodLength,
    };
    await getDb()
      .insert(cycleSettings)
      .values({ ...values, profileId: session.user.id })
      .onConflictDoUpdate({ target: cycleSettings.profileId, set: values });
    revalidatePath("/cycle");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not save preferences. Please try again.",
    };
  }
}

export async function deletePeriod(id: string): Promise<CycleResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in again." };
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return { ok: false, error: "Invalid entry." };
  try {
    await getDb()
      .delete(periodEntries)
      .where(
        and(
          eq(periodEntries.id, id),
          eq(periodEntries.profileId, session.user.id),
        ),
      );
    revalidatePath("/cycle");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not delete this entry. Please try again.",
    };
  }
}
