import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** A learner. Accounts are created by entering a name; there is no password. */
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** Lower-cased name used to find the account again; unique. */
  nameKey: text("name_key").notNull().unique(),
  isVip: boolean("is_vip").notNull().default(false),
  /** Private admin comment about this account. */
  note: text("note").notNull().default(""),
  /** Keyed hash of the parent PIN; null until the parent sets one. */
  parentPinHash: text("parent_pin_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One finished lesson, review or unit test. */
export const sessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
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

/** Spaced-repetition state per account and word. */
export const wordProgress = pgTable(
  "account_words",
  {
    accountId: integer("account_id").notNull(),
    wordId: text("word_id").notNull(),
    box: integer("box").notNull(),
    dueDay: text("due_day").notNull(),
    correct: integer("correct").notNull().default(0),
    wrong: integer("wrong").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.wordId] })],
);

/** Per-day flags set by the admin. */
export const days = pgTable(
  "account_days",
  {
    accountId: integer("account_id").notNull(),
    day: text("day").notNull(),
    offlineDone: boolean("offline_done").notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.day] })],
);

export const prizes = pgTable("account_prizes", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
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
  `CREATE TABLE IF NOT EXISTS accounts (
    id serial PRIMARY KEY,
    name text NOT NULL,
    name_key text NOT NULL UNIQUE,
    is_vip boolean NOT NULL DEFAULT false,
    note text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  // Added after the first release of the accounts table.
  `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS parent_pin_hash text`,
  `CREATE TABLE IF NOT EXISTS study_sessions (
    id serial PRIMARY KEY,
    account_id integer NOT NULL,
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
  `CREATE INDEX IF NOT EXISTS study_sessions_account_day_idx
    ON study_sessions (account_id, day)`,
  `CREATE TABLE IF NOT EXISTS account_words (
    account_id integer NOT NULL,
    word_id text NOT NULL,
    box integer NOT NULL,
    due_day text NOT NULL,
    correct integer NOT NULL DEFAULT 0,
    wrong integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (account_id, word_id)
  )`,
  `CREATE TABLE IF NOT EXISTS account_days (
    account_id integer NOT NULL,
    day text NOT NULL,
    offline_done boolean NOT NULL DEFAULT false,
    PRIMARY KEY (account_id, day)
  )`,
  `CREATE TABLE IF NOT EXISTS account_prizes (
    id serial PRIMARY KEY,
    account_id integer NOT NULL,
    unit_id text NOT NULL,
    title text NOT NULL,
    min_score integer NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    earned_at timestamptz,
    given_at timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS account_prizes_account_idx ON account_prizes (account_id)`,
];
