import {
  MAX_BOX,
  SRS_INTERVAL_DAYS,
  THREE_STAR_SCORE,
  TWO_STAR_SCORE,
} from "@/lib/constants";
import { addDays } from "@/lib/dates";

export function computeScore(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function computeStars(score: number): number {
  if (score >= THREE_STAR_SCORE) return 3;
  if (score >= TWO_STAR_SCORE) return 2;
  return 1;
}

export interface SrsState {
  box: number;
  dueDay: string;
}

/**
 * Leitner-style spaced repetition: a correct answer moves the word one box up
 * (longer interval), a wrong answer sends it back to box 1 for tomorrow.
 */
export function nextSrsState(
  currentBox: number,
  correct: boolean,
  today: string,
): SrsState {
  const box = correct ? Math.min(MAX_BOX, Math.max(1, currentBox + 1)) : 1;
  return { box, dueDay: addDays(today, SRS_INTERVAL_DAYS[box]) };
}
