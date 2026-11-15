import { describe, expect, it } from "vitest";

import { getLesson } from "@/features/content";
import {
  getNextStep,
  getPrizeProgress,
  isDailyLimitReached,
  isLessonUnlocked,
  isTestUnlocked,
  isUnitUnlocked,
} from "@/features/progress/lib/unlock";
import type { AppState, Prize } from "@/features/progress/types";
import { DAILY_NEW_LESSON_LIMIT } from "@/lib/constants";

type Progress = Pick<AppState, "lessons" | "tests">;

const done = { stars: 3, bestScore: 100 };
const EMPTY: Progress = { lessons: {}, tests: {} };
const LESSONS_DONE: Progress = {
  lessons: { "colours-1": done, "colours-2": done },
  tests: {},
};
const UNIT_PASSED: Progress = { ...LESSONS_DONE, tests: { colours: done } };

function lesson(id: string) {
  const found = getLesson(id);
  if (!found) throw new Error(`Unknown lesson ${id}`);
  return found;
}

describe("unlock rules", () => {
  it("opens only the first lesson for a new learner", () => {
    expect(isLessonUnlocked(lesson("colours-1"), EMPTY)).toBe(true);
    expect(isLessonUnlocked(lesson("colours-2"), EMPTY)).toBe(false);
    expect(isTestUnlocked("colours", EMPTY)).toBe(false);
    expect(isUnitUnlocked("numbers", EMPTY)).toBe(false);
  });

  it("opens the unit test after all lessons", () => {
    expect(isTestUnlocked("colours", LESSONS_DONE)).toBe(true);
    expect(isLessonUnlocked(lesson("numbers-1"), LESSONS_DONE)).toBe(false);
  });

  it("keeps the next unit closed until the test is passed", () => {
    const failed: Progress = {
      ...LESSONS_DONE,
      tests: { colours: { stars: 1, bestScore: 50 } },
    };
    expect(isUnitUnlocked("numbers", failed)).toBe(false);
    expect(isUnitUnlocked("numbers", UNIT_PASSED)).toBe(true);
    expect(isLessonUnlocked(lesson("numbers-1"), UNIT_PASSED)).toBe(true);
  });
});

describe("getNextStep", () => {
  it("walks lesson by lesson, then the test, then the next unit", () => {
    expect(getNextStep(EMPTY)).toMatchObject({
      type: "lesson",
      lesson: { id: "colours-1" },
    });
    expect(getNextStep(LESSONS_DONE)).toMatchObject({
      type: "test",
      unit: { id: "colours" },
    });
    expect(getNextStep(UNIT_PASSED)).toMatchObject({
      type: "lesson",
      lesson: { id: "numbers-1" },
    });
  });
});

describe("isDailyLimitReached", () => {
  const stats = { lessonDone: true, reviewDone: false, offlineDone: false };
  const account = { id: 1, name: "Ali", isVip: false };
  const atLimit = { ...stats, newLessons: DAILY_NEW_LESSON_LIMIT };

  it("caps new lessons per day", () => {
    expect(
      isDailyLimitReached({
        account,
        todayStats: { ...stats, newLessons: DAILY_NEW_LESSON_LIMIT - 1 },
      }),
    ).toBe(false);
    expect(isDailyLimitReached({ account, todayStats: atLimit })).toBe(true);
  });

  it("never caps a VIP account", () => {
    expect(
      isDailyLimitReached({ account: { ...account, isVip: true }, todayStats: atLimit }),
    ).toBe(false);
  });
});

describe("getPrizeProgress", () => {
  const prize: Prize = {
    id: 1,
    unitId: "colours",
    title: "Bicycle bell",
    minScore: 80,
    status: "active",
    createdAt: "2026-11-14T00:00:00.000Z",
    earnedAt: null,
    givenAt: null,
  };

  it("counts lessons and the test as steps", () => {
    expect(getPrizeProgress(prize, EMPTY)).toEqual({ done: 0, total: 3, stepsLeft: 3 });
    expect(getPrizeProgress(prize, LESSONS_DONE)).toEqual({
      done: 2,
      total: 3,
      stepsLeft: 1,
    });
  });

  it("does not count a test below the prize score", () => {
    const lowScore: Progress = {
      ...LESSONS_DONE,
      tests: { colours: { stars: 2, bestScore: 75 } },
    };
    expect(getPrizeProgress(prize, lowScore).stepsLeft).toBe(1);
  });

  it("is complete once the prize is earned", () => {
    expect(getPrizeProgress({ ...prize, status: "earned" }, UNIT_PASSED).stepsLeft).toBe(
      0,
    );
  });
});
