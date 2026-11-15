import { ALL_LESSONS } from "@/features/content";
import type { Roadmap, RoadmapStatus } from "@/features/admin/types";
import { ROADMAP_TOLERANCE_LESSONS, TARGET_LESSONS_PER_WEEK } from "@/lib/constants";
import { diffDays } from "@/lib/dates";

const DAYS_PER_WEEK = 7;

/** Compares finished lessons with the planned pace since the first session. */
export function buildRoadmap(
  startDay: string | null,
  completedLessons: number,
  today: string,
): Roadmap {
  const totalLessons = ALL_LESSONS.length;
  if (!startDay) {
    return {
      startDay,
      completedLessons,
      totalLessons,
      expectedLessons: 0,
      status: "not_started",
    };
  }

  const weeks = (diffDays(startDay, today) + 1) / DAYS_PER_WEEK;
  const expectedLessons = Math.min(
    totalLessons,
    Math.floor(weeks * TARGET_LESSONS_PER_WEEK),
  );
  const gap = completedLessons - expectedLessons;

  let status: RoadmapStatus = "on_track";
  if (gap > ROADMAP_TOLERANCE_LESSONS) status = "ahead";
  if (gap < -ROADMAP_TOLERANCE_LESSONS) status = "behind";

  return { startDay, completedLessons, totalLessons, expectedLessons, status };
}
