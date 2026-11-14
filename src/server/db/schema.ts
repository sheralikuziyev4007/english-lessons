import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** One finished lesson, review or unit test. */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  refId: text("ref_id").notNull(),
  correct: integer("correct").notNull(),
  total: integer("total").notNull(),
  score: integer("score").notNull(),
  stars: integer("stars").notNull(),
  durationSec: integer("duration_sec").notNull().default(0),
  day: text("day").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Spaced-repetition state per word. */
export const wordProgress = pgTable("word_progress", {
  wordId: text("word_id").primaryKey(),
  box: integer("box").notNull(),
  dueDay: text("due_day").notNull(),
  correct: integer("correct").notNull().default(0),
  wrong: integer("wrong").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Per-day flags set by the parent. */
export const days = pgTable("days", {
  day: text("day").primaryKey(),
  offlineDone: boolean("offline_done").notNull().default(false),
});

export const prizes = pgTable("prizes", {
  id: serial("id").primaryKey(),
  unitId: text("unit_id").notNull(),
  title: text("title").notNull(),
  minScore: integer("min_score").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  earnedAt: timestamp("earned_at", { withTimezone: true }),
  givenAt: timestamp("given_at", { withTimezone: true }),
});

/**
 * Idempotent DDL that mirrors the tables above. It runs once per server
 * instance, so a fresh Neon database needs no manual migration step.
 */
export const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS sessions (
    id serial PRIMARY KEY,
    kind text NOT NULL,
    ref_id text NOT NULL,
    correct integer NOT NULL,
    total integer NOT NULL,
    score integer NOT NULL,
    stars integer NOT NULL,
    duration_sec integer NOT NULL DEFAULT 0,
    day text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_day_idx ON sessions (day)`,
  `CREATE TABLE IF NOT EXISTS word_progress (
    word_id text PRIMARY KEY,
    box integer NOT NULL,
    due_day text NOT NULL,
    correct integer NOT NULL DEFAULT 0,
    wrong integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS days (
    day text PRIMARY KEY,
    offline_done boolean NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS prizes (
    id serial PRIMARY KEY,
    unit_id text NOT NULL,
    title text NOT NULL,
    min_score integer NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    earned_at timestamptz,
    given_at timestamptz
  )`,
];
