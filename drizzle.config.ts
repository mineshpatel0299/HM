import type { Config } from "drizzle-kit";

// Migrations run over the direct (unpooled) connection, per Neon's
// guidance — the pooled connection doesn't support the session-level
// operations schema migrations rely on.
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
} satisfies Config;
