import "server-only";

import { and, desc, eq, inArray, max, min, sql } from "drizzle-orm";

import { getLesson, getUnit, getWord, UNITS } from "@/features/content";
import type {
  AppState,
  LessonProgress,
  Prize,
  SessionInput,
  SessionResult,
  TestProgress,
  WordProgress,
} from "@/features/progress/types";
import {
  DAILY_NEW_LESSON_LIMIT,
  LEARNED_BOX,
  PASS_SCORE,
  REVIEW_REF_ID,
} from "@/lib/constants";
import { computeStreak, dayKey } from "@/lib/dates";
import { computeScore, computeStars, nextSrsState } from "@/lib/scoring";
import { getDb, type Db } from "@/server/db/client";
import { accounts, days, prizes, sessions, wordProgress } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import { toPrize } from "@/server/services/prize-service";

const STREAK_LOOKBACK_DAYS = 400;
const UNIT_ORDER = new Map(UNITS.map((unit, index) => [unit.id, index]));

/** Picks the prize to show the learner: an earned one first, then the nearest unit. */
function pickCurrentPrize(open: Prize[]): Prize | null {
  const byUnitOrder = (a: Prize, b: Prize) =>
    (UNIT_ORDER.get(a.unitId) ?? 0) - (UNIT_ORDER.get(b.unitId) ?? 0);
  const earned = open.filter((prize) => prize.status === "earned").sort(byUnitOrder);
  const active = open.filter((prize) => prize.status === "active").sort(byUnitOrder);
  return earned[0] ?? active[0] ?? null;
}

export async function getState(
  accountId: number,
  today: string = dayKey(),
): Promise<AppState> {
  const db = await getDb();
  const mine = eq(sessions.accountId, accountId);

  const [accountRows, bestRows, dayRows, wordRows, todayRows, todayFlags, prizeRows] =
    await Promise.all([
      db.select().from(accounts).where(eq(accounts.id, accountId)),
      db
        .select({
          kind: sessions.kind,
          refId: sessions.refId,
          stars: max(sessions.stars),
          score: max(sessions.score),
          firstDay: min(sessions.day),
        })
        .from(sessions)
        .where(mine)
        .groupBy(sessions.kind, sessions.refId),
      db
        .selectDistinct({ day: sessions.day })
        .from(sessions)
        .where(mine)
        .orderBy(desc(sessions.day))
        .limit(STREAK_LOOKBACK_DAYS),
      db.select().from(wordProgress).where(eq(wordProgress.accountId, accountId)),
      db
        .select({ kind: sessions.kind })
        .from(sessions)
        .where(and(mine, eq(sessions.day, today))),
      db
        .select()
        .from(days)
        .where(and(eq(days.accountId, accountId), eq(days.day, today))),
      db
        .select()
        .from(prizes)
        .where(
          and(
            eq(prizes.accountId, accountId),
            inArray(prizes.status, ["active", "earned"]),
          ),
        ),
    ]);

  // The cookie can outlive the account (e.g. after a database reset).
  const account = accountRows[0];
  if (!account) throw new HttpError(401, "unauthorized");

  const lessons: Record<string, LessonProgress> = {};
  const tests: Record<string, TestProgress> = {};
  let newLessons = 0;
  let totalStars = 0;

  for (const row of bestRows) {
    const progress = { stars: row.stars ?? 0, bestScore: row.score ?? 0 };
    if (row.kind === "lesson") {
      lessons[row.refId] = progress;
      totalStars += progress.stars;
      if (row.firstDay === today) newLessons += 1;
    } else if (row.kind === "test") {
      tests[row.refId] = progress;
      totalStars += progress.stars;
    }
  }

  const words: Record<string, WordProgress> = {};
  const dueWordIds: string[] = [];
  let learnedWords = 0;

  for (const row of wordRows) {
    words[row.wordId] = {
      box: row.box,
      dueDay: row.dueDay,
      correct: row.correct,
      wrong: row.wrong,
    };
    if (row.box >= LEARNED_BOX) learnedWords += 1;
    if (row.dueDay <= today && getWord(row.wordId)) dueWordIds.push(row.wordId);
  }

  const todayKinds = new Set(todayRows.map((row) => row.kind));

  return {
    account: { id: account.id, name: account.name, isVip: account.isVip },
    today,
    lessons,
    tests,
    words,
    dueWordIds,
    todayStats: {
      newLessons,
      lessonDone: todayKinds.has("lesson"),
      reviewDone: todayKinds.has("review"),
      offlineDone: todayFlags[0]?.offlineDone ?? false,
    },
    streak: computeStreak(
      dayRows.map((row) => row.day),
      today,
    ),
    totalStars,
    learnedWords,
    prize: pickCurrentPrize(prizeRows.map(toPrize)),
  };
}

function assertValidTarget(input: SessionInput): void {
  const exists =
    (input.kind === "lesson" && getLesson(input.refId) !== undefined) ||
    (input.kind === "test" && getUnit(input.refId) !== undefined) ||
    (input.kind === "review" && input.refId === REVIEW_REF_ID);
  if (!exists || input.answers.some((answer) => !getWord(answer.wordId))) {
    throw new HttpError(400, "invalid_request");
  }
}

async function updateWordProgress(
  db: Db,
  accountId: number,
  input: SessionInput,
  today: string,
): Promise<void> {
  // A word counts as known in this session only if every answer for it was correct.
  const outcome = new Map<string, boolean>();
  for (const answer of input.answers) {
    outcome.set(answer.wordId, (outcome.get(answer.wordId) ?? true) && answer.correct);
  }

  const wordIds = [...outcome.keys()];
  const existing = await db
    .select()
    .from(wordProgress)
    .where(
      and(eq(wordProgress.accountId, accountId), inArray(wordProgress.wordId, wordIds)),
    );
  const current = new Map(existing.map((row) => [row.wordId, row]));

  const rows = wordIds.map((wordId) => {
    const previous = current.get(wordId);
    const correct = outcome.get(wordId) ?? false;
    const next = nextSrsState(previous?.box ?? 0, correct, today);
    return {
      accountId,
      wordId,
      box: next.box,
      dueDay: next.dueDay,
      correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
      wrong: (previous?.wrong ?? 0) + (correct ? 0 : 1),
      updatedAt: new Date(),
    };
  });

  await db
    .insert(wordProgress)
    .values(rows)
    .onConflictDoUpdate({
      target: [wordProgress.accountId, wordProgress.wordId],
      set: {
        box: sql`excluded.box`,
        dueDay: sql`excluded.due_day`,
        correct: sql`excluded.correct`,
        wrong: sql`excluded.wrong`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
}

/** Marks the unit's active prize as earned when the test score is high enough. */
async function awardPrize(
  db: Db,
  accountId: number,
  unitId: string,
  score: number,
): Promise<Prize | null> {
  const [active] = await db
    .select()
    .from(prizes)
    .where(
      and(
        eq(prizes.accountId, accountId),
        eq(prizes.unitId, unitId),
        eq(prizes.status, "active"),
      ),
    )
    .limit(1);
  if (!active || score < active.minScore) return null;

  const [updated] = await db
    .update(prizes)
    .set({ status: "earned", earnedAt: new Date() })
    .where(and(eq(prizes.id, active.id), eq(prizes.status, "active")))
    .returning();
  return updated ? toPrize(updated) : null;
}

/**
 * Server-side daily cap: a non-VIP account may start only a limited number of
 * new lessons per day. Repeating a finished lesson is always allowed.
 */
async function assertWithinDailyLimit(
  db: Db,
  accountId: number,
  lessonId: string,
  today: string,
): Promise<void> {
  const [[account], firstDays] = await Promise.all([
    db.select({ isVip: accounts.isVip }).from(accounts).where(eq(accounts.id, accountId)),
    db
      .select({ refId: sessions.refId, firstDay: min(sessions.day) })
      .from(sessions)
      .where(and(eq(sessions.accountId, accountId), eq(sessions.kind, "lesson")))
      .groupBy(sessions.refId),
  ]);
  if (!account) throw new HttpError(401, "unauthorized");
  if (account.isVip || firstDays.some((row) => row.refId === lessonId)) return;

  const newToday = firstDays.filter((row) => row.firstDay === today).length;
  if (newToday >= DAILY_NEW_LESSON_LIMIT) throw new HttpError(403, "daily_limit");
}

export async function recordSession(
  accountId: number,
  input: SessionInput,
  today: string = dayKey(),
): Promise<SessionResult> {
  assertValidTarget(input);
  const db = await getDb();
  if (input.kind === "lesson")
    await assertWithinDailyLimit(db, accountId, input.refId, today);

  const total = input.answers.length;
  const correct = input.answers.filter((answer) => answer.correct).length;
  const score = computeScore(correct, total);
  const stars = input.kind === "review" ? 0 : computeStars(score);

  await db.insert(sessions).values({
    accountId,
    kind: input.kind,
    refId: input.refId,
    correct,
    total,
    score,
    stars,
    durationSec: input.durationSec,
    day: today,
  });
  await updateWordProgress(db, accountId, input, today);

  const prizeEarned =
    input.kind === "test" ? await awardPrize(db, accountId, input.refId, score) : null;
  const passed = input.kind === "test" ? score >= PASS_SCORE : true;

  return { score, stars, passed, prizeEarned };
}
