export type PrizeStatus = "active" | "earned" | "given" | "cancelled";

export interface Prize {
  id: number;
  unitId: string;
  title: string;
  minScore: number;
  status: PrizeStatus;
  createdAt: string;
  earnedAt: string | null;
  givenAt: string | null;
}

export interface WordProgress {
  box: number;
  dueDay: string;
  correct: number;
  wrong: number;
}

export interface LessonProgress {
  stars: number;
  bestScore: number;
}

export interface TestProgress {
  stars: number;
  bestScore: number;
}

export interface TodayStats {
  /** Lessons completed for the first time today. */
  newLessons: number;
  lessonDone: boolean;
  reviewDone: boolean;
  offlineDone: boolean;
}

/** Everything the child-facing screens need, returned by GET /api/state. */
export interface AppState {
  today: string;
  lessons: Record<string, LessonProgress>;
  tests: Record<string, TestProgress>;
  words: Record<string, WordProgress>;
  dueWordIds: string[];
  todayStats: TodayStats;
  streak: number;
  totalStars: number;
  learnedWords: number;
  /** The prize the child is working towards (or has just earned). */
  prize: Prize | null;
}

export type SessionKind = "lesson" | "review" | "test";

export interface SessionAnswer {
  wordId: string;
  correct: boolean;
}

export interface SessionInput {
  kind: SessionKind;
  refId: string;
  durationSec: number;
  answers: SessionAnswer[];
}

export interface SessionResult {
  score: number;
  stars: number;
  passed: boolean;
  prizeEarned: Prize | null;
}
