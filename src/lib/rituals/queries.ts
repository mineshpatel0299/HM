import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { getDb, withDbRetry } from "@/lib/db/client";
import { rituals } from "@/lib/db/schema";

export type RitualKind = "goodnight" | "goodmorning";

/** True if `authorId` already logged `kind` today, in *their own* timezone. */
export async function hasLoggedToday(
  coupleId: string,
  authorId: string,
  kind: RitualKind,
  timezone: string,
): Promise<boolean> {
  const db = getDb();
  const [row] = await withDbRetry(() =>
    db
      .select({ createdAt: rituals.createdAt })
      .from(rituals)
      .where(
        and(eq(rituals.coupleId, coupleId), eq(rituals.authorId, authorId), eq(rituals.kind, kind)),
      )
      .orderBy(desc(rituals.createdAt))
      .limit(1),
  );
  if (!row) return false;
  const todayKey = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  return formatInTimeZone(row.createdAt, timezone, "yyyy-MM-dd") === todayKey;
}
