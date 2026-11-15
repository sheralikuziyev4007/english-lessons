import { describe, expect, it } from "vitest";

import { buildRoadmap } from "@/features/admin/lib/roadmap";

describe("buildRoadmap", () => {
  it("reports not started before the first session", () => {
    expect(buildRoadmap(null, 0, "2026-11-14").status).toBe("not_started");
  });

  it("is on track during the first days", () => {
    expect(buildRoadmap("2026-11-14", 1, "2026-11-14")).toMatchObject({
      expectedLessons: 0,
      status: "on_track",
    });
  });

  it("flags a learner who falls behind the weekly pace", () => {
    // Four full weeks at 5 lessons a week = 20 planned lessons.
    expect(buildRoadmap("2026-10-18", 10, "2026-11-14")).toMatchObject({
      expectedLessons: 20,
      status: "behind",
    });
  });

  it("flags a learner who is ahead", () => {
    expect(buildRoadmap("2026-11-08", 12, "2026-11-14").status).toBe("ahead");
  });
});
