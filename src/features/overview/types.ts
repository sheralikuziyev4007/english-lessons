import type { AppState, Prize } from "@/features/progress/types";

export interface ActivityDay {
  day: string;
  minutes: number;
  sessions: number;
}

export interface HardWord {
  wordId: string;
  wrong: number;
  correct: number;
}

export type RoadmapStatus = "not_started" | "ahead" | "on_track" | "behind";

export interface Roadmap {
  startDay: string | null;
  completedLessons: number;
  totalLessons: number;
  expectedLessons: number;
  status: RoadmapStatus;
}

/**
 * One learner's results. Shown to the parent (GET /api/parent/overview) and,
 * for any account, to the admin.
 */
export interface Overview {
  state: AppState;
  prizes: Prize[];
  activity: ActivityDay[];
  hardWords: HardWord[];
  roadmap: Roadmap;
}
