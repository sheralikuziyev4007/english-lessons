import { ALL_LESSONS, getStageLessons, STAGES } from "@/features/content";
import type { Roadmap, RoadmapStatus, StageProgress } from "@/features/overview/types";
import { ROADMAP_TOLERANCE_LESSONS, TARGET_LESSONS_PER_WEEK } from "@/lib/constants";
import { diffDays } from "@/lib/dates";

const DAYS_PER_WEEK = 7;

function buildStages(done: ReadonlySet<string>): StageProgress[] {
  return STAGES.map((stage) => {
    const lessons = getStageLessons(stage);
    return {
      id: stage.id,
      completedLessons: lessons.filter((lesson) => done.has(lesson.id)).length,
      totalLessons: lessons.length,
    };
  });
}

/**
 * Progress per stage, plus a comparison of the finished lessons with the
 * planned pace since the first session.
 */
export function buildRoadmap(
  startDay: string | null,
  doneLessonIds: readonly string[],
  today: string,
): Roadmap {
  const done = new Set(doneLessonIds);
  const stages = buildStages(done);
  const totalLessons = ALL_LESSONS.length;
  const completedLessons = stages.reduce((sum, stage) => sum + stage.completedLessons, 0);

  if (!startDay) {
    return {
      startDay,
      stages,
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

  return { startDay, stages, completedLessons, totalLessons, expectedLessons, status };
}
