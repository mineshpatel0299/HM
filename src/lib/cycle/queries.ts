import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, withDbRetry } from "@/lib/db/client";
import { cycleSettings, periodEntries } from "@/lib/db/schema";
import { auth } from "@/auth";
import type { CycleState } from "./types";

export async function getCycleState(): Promise<CycleState> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Sign in to view your cycle.");
  const db = getDb();
  try {
    const [settings, entries] = await withDbRetry(() =>
      Promise.all([
        db
          .select()
          .from(cycleSettings)
          .where(eq(cycleSettings.profileId, session.user.id))
          .limit(1),
        db
          .select({
            id: periodEntries.id,
            startDate: periodEntries.startDate,
            endDate: periodEntries.endDate,
            symptoms: periodEntries.symptoms,
            note: periodEntries.note,
          })
          .from(periodEntries)
          .where(eq(periodEntries.profileId, session.user.id))
          .orderBy(desc(periodEntries.startDate)),
      ]),
    );
    return {
      available: true,
      settings: settings[0] ?? { cycleLength: 28, periodLength: 5 },
      entries,
    };
  } catch (error) {
    // Keep the rest of the app usable until the included migration is applied.
    const code = error as { code?: string; cause?: { code?: string } };
    if (code.code === "42P01" || code.cause?.code === "42P01")
      return {
        available: false,
        settings: { cycleLength: 28, periodLength: 5 },
        entries: [],
      };
    throw error;
  }
}
