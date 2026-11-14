import { diffDays } from "@/lib/dates";

const ROTATION_START = "2026-01-01";

/** Picks the day's away-from-screen task; the list rotates one task per day. */
export function getOfflineTask(tasks: readonly string[], today: string): string {
  return tasks[Math.abs(diffDays(ROTATION_START, today)) % tasks.length];
}
