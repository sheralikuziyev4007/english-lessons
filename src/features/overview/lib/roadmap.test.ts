import { describe, expect, it } from "vitest";

import { ALL_LESSONS, getStageLessons, STAGES } from "@/features/content";
import { buildRoadmap } from "@/features/overview/lib/roadmap";

const lessonIds = (count: number) =>
  ALL_LESSONS.slice(0, count).map((lesson) => lesson.id);

describe("buildRoadmap", () => {
  it("reports not started before the first session", () => {
    const roadmap = buildRoadmap(null, [], "2026-11-14");
    expect(roadmap.status).toBe("not_started");
    expect(roadmap.totalLessons).toBe(ALL_LESSONS.length);
  });

  it("is on track during the first days", () => {
    expect(buildRoadmap("2026-11-14", lessonIds(1), "2026-11-14")).toMatchObject({
      expectedLessons: 0,
      status: "on_track",
    });
  });

  it("flags a learner who falls behind the weekly pace", () => {
    // Four full weeks at 5 lessons a week = 20 planned lessons.
    expect(buildRoadmap("2026-10-18", lessonIds(10), "2026-11-14")).toMatchObject({
      expectedLessons: 20,
      completedLessons: 10,
      status: "behind",
    });
  });

  it("flags a learner who is ahead", () => {
    expect(buildRoadmap("2026-11-08", lessonIds(12), "2026-11-14").status).toBe("ahead");
  });

  it("counts finished lessons separately for every stage", () => {
    const starters = getStageLessons(STAGES[0]).length;
    const roadmap = buildRoadmap("2026-11-01", lessonIds(starters + 3), "2026-11-14");

    expect(roadmap.stages).toEqual([
      { id: "starters", completedLessons: starters, totalLessons: starters },
      {
        id: "movers",
        completedLessons: 3,
        totalLessons: getStageLessons(STAGES[1]).length,
      },
    ]);
  });
});
