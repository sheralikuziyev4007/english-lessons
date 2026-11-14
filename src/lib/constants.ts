export const APP_NAME = "Starway English";
export const APP_DESCRIPTION =
  "A daily English course for young learners, built around the Cambridge Pre A1 Starters level.";

/** All "today" calculations use the family's local time zone. */
export const APP_TIME_ZONE = "Asia/Tashkent";

export const ROUTES = {
  home: "/",
  login: "/login",
  review: "/review",
  parent: "/parent",
  lesson: (lessonId: string) => `/lesson/${lessonId}`,
  test: (unitId: string) => `/test/${unitId}`,
} as const;

export const QUERY_KEYS = {
  state: ["state"],
  parentOverview: ["parent-overview"],
} as const;

/** Minimum unit test score (percent) that unlocks the next unit. */
export const PASS_SCORE = 70;
export const DEFAULT_PRIZE_SCORE = 80;
export const MIN_PRIZE_SCORE = 50;
export const MAX_PRIZE_SCORE = 100;
export const PRIZE_TITLE_MAX_LENGTH = 80;

export const DAILY_NEW_LESSON_LIMIT = 2;
export const REVIEW_BATCH_SIZE = 12;
export const TEST_QUESTION_COUNT = 12;
export const TEST_OPTION_COUNT = 3;
export const LESSON_OPTION_COUNT = 4;
export const MATCH_PAIR_COUNT = 5;
export const LESSONS_PER_UNIT = 2;

export const THREE_STAR_SCORE = 90;
export const TWO_STAR_SCORE = 70;
export const MAX_STARS = 3;

/** Leitner boxes: days until a word comes back for review. */
export const SRS_INTERVAL_DAYS: Readonly<Record<number, number>> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
};
export const MAX_BOX = 5;
export const LEARNED_BOX = 3;
export const HARD_WORD_MIN_WRONG = 2;
export const HARD_WORD_LIMIT = 10;

export const ACTIVITY_DAYS = 7;
export const TARGET_LESSONS_PER_WEEK = 5;
export const ROADMAP_TOLERANCE_LESSONS = 2;

export const SESSION_COOKIE = "family_session";
export const PARENT_COOKIE = "parent_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 180;
export const PARENT_MAX_AGE_SEC = 60 * 30;
export const PIN_LENGTH = 4;

export const MAX_SESSION_DURATION_SEC = 60 * 60 * 2;
export const MAX_SESSION_ANSWERS = 100;
export const SPEECH_RATE = 0.85;
export const REVIEW_REF_ID = "review";
