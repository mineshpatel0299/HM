import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  jsonb,
  doublePrecision,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // Required by the Credentials provider (Phase 2 step 3) even though it
  // isn't one of the fields the phase brief enumerated for this table.
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  timezone: text("timezone").notNull(),
  avatarUrl: text("avatar_url"),
  // For WeatherBridge (Phase 5). Nullable — set lazily the first time
  // someone opens the weather prompt, not forced at signup, since existing
  // accounts never went through a location step.
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  locationLabel: text("location_label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const couples = pgTable("couples", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteCode: text("invite_code").notNull().unique(),
  partnerAId: uuid("partner_a_id").references(() => profiles.id),
  partnerBId: uuid("partner_b_id").references(() => profiles.id),
  // Nullable: the pairing flow (Phase 2 step 5) never sets these at
  // creation time — "since" is a sentimental date the couple sets later,
  // not the row's created_at.
  sinceDate: date("since_date"),
  nextVisitDate: date("next_visit_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pings = pgTable("pings", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  fromId: uuid("from_id").notNull().references(() => profiles.id),
  toId: uuid("to_id").notNull().references(() => profiles.id),
  // Plain text (not a pg enum) per the phase brief; PingKind in
  // src/lib/pings/types.ts is the source of truth for the allowed values.
  kind: text("kind").notNull().$type<"ping" | "haptic" | "heartbeat">(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const liveStatus = pgTable("live_status", {
  // profileId as the primary key (not a separate id column, matching the
  // brief's column list) — one status row per person, upserted on change.
  profileId: uuid("profile_id").primaryKey().references(() => profiles.id),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sparkAnswers = pgTable(
  "spark_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id").notNull().references(() => couples.id),
    promptId: text("prompt_id").notNull(),
    authorId: uuid("author_id").notNull().references(() => profiles.id),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.promptId, table.authorId)],
);

export const diaryEntries = pgTable(
  "diary_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id").notNull().references(() => couples.id),
    entryDate: date("entry_date").notNull(),
    authorId: uuid("author_id").notNull().references(() => profiles.id),
    entry: text("entry").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.entryDate, table.authorId)],
);

export const truthLadderProgress = pgTable("truth_ladder_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().unique().references(() => couples.id),
  currentLevel: integer("current_level").notNull().default(1),
  // Not in the brief's literal column list, but required for "both partners
  // must mark the current level answered before the next one unlocks" —
  // profile IDs that have acked the CURRENT level, cleared to [] on advance.
  ackedBy: jsonb("acked_by").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guessPredictions = pgTable(
  "guess_predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id").notNull().references(() => couples.id),
    predictDate: date("predict_date").notNull(),
    authorId: uuid("author_id").notNull().references(() => profiles.id),
    prediction: text("prediction").notNull(),
    actual: text("actual"),
    correct: boolean("correct"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.predictDate, table.authorId)],
);

export const moments = pgTable("moments", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  text: text("text").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const moodCheckins = pgTable("mood_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  moodScore: integer("mood_score").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rituals = pgTable("rituals", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  kind: text("kind").notNull().$type<"goodnight" | "goodmorning">(),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  label: text("label").notNull(),
  achievedAt: date("achieved_at").notNull(),
  isStreak: boolean("is_streak").notNull().default(false),
  streakCount: integer("streak_count"),
});

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  r2Key: text("r2_key").notNull(),
  caption: text("caption"),
  takenAt: date("taken_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const timeCapsules = pgTable("time_capsules", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  content: text("content").notNull(),
  r2Key: text("r2_key"),
  unlockAt: timestamp("unlock_at", { withTimezone: true }).notNull(),
  unlocked: boolean("unlocked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jarNotes = pgTable("jar_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  text: text("text").notNull(),
  opened: boolean("opened").notNull().default(false),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const unsentMessages = pgTable("unsent_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  text: text("text").notNull(),
  visibility: text("visibility")
    .notNull()
    .$type<"private" | "unlock_on_date" | "unlock_on_read_request">(),
  unlockAt: timestamp("unlock_at", { withTimezone: true }),
  revealed: boolean("revealed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id),
  // One row per browser/device subscription, not per profile — the same
  // person can have a phone and a laptop both wanting pushes.
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scheduledNotes = pgTable("scheduled_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  toId: uuid("to_id").notNull().references(() => profiles.id),
  text: text("text").notNull(),
  sendAt: timestamp("send_at", { withTimezone: true }).notNull(),
  sent: boolean("sent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
