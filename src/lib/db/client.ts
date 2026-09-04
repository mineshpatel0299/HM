import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

// Lazy singleton, not a Proxy — Next.js evaluates top-level module code at
// build time, so calling neon() eagerly would throw when DATABASE_URL isn't
// set yet. A Proxy wrapper would fix that but breaks libraries (e.g. Auth.js
// adapters) that inspect the db object's own methods/properties.
export function getDb(): Db {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

/**
 * Neon computes scale to zero after a few minutes idle; the query that
 * wakes one occasionally fails outright rather than just being slow,
 * especially a few queries into the same request. Retry transient
 * failures once with a short delay instead of surfacing a wake-up blip as
 * a hard error.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
