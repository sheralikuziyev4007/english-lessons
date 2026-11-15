import type { AppState, Prize } from "@/features/progress/types";

export interface AccountDetails {
  id: number;
  name: string;
  /** VIP accounts have no daily limit on new lessons. */
  isVip: boolean;
  /** Private admin comment; never shown to the learner. */
  note: string;
  createdAt: string;
}

export interface AccountSummary extends AccountDetails {
  lastActiveDay: string | null;
  lessonsDone: number;
}

/** Returned by GET /api/admin/accounts. */
export interface AccountsList {
  total: number;
  accounts: AccountSummary[];
}

export interface AccountUpdate {
  isVip?: boolean;
  note?: string;
}

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

/** Returned by GET /api/admin/accounts/:id. */
export interface AccountOverview {
  account: AccountDetails;
  state: AppState;
  prizes: Prize[];
  activity: ActivityDay[];
  hardWords: HardWord[];
  roadmap: Roadmap;
}
