import { APP_TIME_ZONE } from "@/lib/constants";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Returns a YYYY-MM-DD key for the given moment in the app time zone. */
export function dayKey(
  date: Date = new Date(),
  timeZone: string = APP_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toUtcMs(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addDays(key: string, amount: number): string {
  return new Date(toUtcMs(key) + amount * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** The last `count` day keys ending with `today`, oldest first. */
export function lastDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(today, index - (count - 1)));
}

/**
 * Counts consecutive active days. The streak is still alive if the child
 * has not practised yet today but did yesterday.
 */
export function computeStreak(activeDays: readonly string[], today: string): number {
  const active = new Set(activeDays);
  let cursor = active.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** "2026-11-14" -> "14.11.2026" */
export function formatDayKey(key: string): string {
  const [year, month, day] = key.split("-");
  return `${day}.${month}.${year}`;
}
