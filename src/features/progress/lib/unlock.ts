import {
  ALL_LESSONS,
  getUnitLessons,
  UNITS,
  type Lesson,
  type Unit,
} from "@/features/content";
import type { AppState, Prize } from "@/features/progress/types";
import { DAILY_NEW_LESSON_LIMIT, PASS_SCORE } from "@/lib/constants";

type Progress = Pick<AppState, "lessons" | "tests">;

export function isLessonDone(lessonId: string, state: Progress): boolean {
  return lessonId in state.lessons;
}

export function isTestPassed(unitId: string, state: Progress): boolean {
  return (state.tests[unitId]?.bestScore ?? 0) >= PASS_SCORE;
}

/** A unit opens when the previous unit's test has been passed. */
export function isUnitUnlocked(unitId: string, state: Progress): boolean {
  const index = UNITS.findIndex((unit) => unit.id === unitId);
  if (index <= 0) return index === 0;
  return isTestPassed(UNITS[index - 1].id, state);
}

export function isLessonUnlocked(lesson: Lesson, state: Progress): boolean {
  if (!isUnitUnlocked(lesson.unitId, state)) return false;
  const lessons = getUnitLessons(lesson.unitId);
  const previous = lessons[lesson.number - 2];
  return previous ? isLessonDone(previous.id, state) : true;
}

export function isTestUnlocked(unitId: string, state: Progress): boolean {
  return (
    isUnitUnlocked(unitId, state) &&
    getUnitLessons(unitId).every((lesson) => isLessonDone(lesson.id, state))
  );
}

export type NextStep =
  | { type: "lesson"; lesson: Lesson; unit: Unit }
  | { type: "test"; unit: Unit }
  | { type: "finished" };

/** The next thing the child should do on the course path. */
export function getNextStep(state: Progress): NextStep {
  for (const unit of UNITS) {
    const lesson = getUnitLessons(unit.id).find((item) => !isLessonDone(item.id, state));
    if (lesson) return { type: "lesson", lesson, unit };
    if (!isTestPassed(unit.id, state)) return { type: "test", unit };
  }
  return { type: "finished" };
}

/**
 * New lessons are capped per day; repeating a finished lesson is always allowed.
 * VIP accounts have no cap.
 */
export function isDailyLimitReached(
  state: Pick<AppState, "todayStats" | "account">,
): boolean {
  return !state.account.isVip && state.todayStats.newLessons >= DAILY_NEW_LESSON_LIMIT;
}

export interface PrizeProgress {
  done: number;
  total: number;
  stepsLeft: number;
}

/** Steps towards a prize: every lesson of the unit plus the unit test. */
export function getPrizeProgress(prize: Prize, state: Progress): PrizeProgress {
  const lessons = getUnitLessons(prize.unitId);
  const lessonsDone = lessons.filter((lesson) => isLessonDone(lesson.id, state)).length;
  const testDone = (state.tests[prize.unitId]?.bestScore ?? 0) >= prize.minScore ? 1 : 0;
  const total = lessons.length + 1;
  const done = prize.status === "active" ? lessonsDone + testDone : total;
  return { done, total, stepsLeft: total - done };
}

export const TOTAL_LESSONS = ALL_LESSONS.length;
