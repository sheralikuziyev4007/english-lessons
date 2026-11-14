import { describe, expect, it } from "vitest";

import { addDays, computeStreak, dayKey, diffDays, lastDays } from "@/lib/dates";

describe("dayKey", () => {
  it("uses the app time zone, not UTC", () => {
    // 20:30 UTC is already the next day in Tashkent (UTC+5).
    expect(dayKey(new Date("2026-11-14T20:30:00Z"), "Asia/Tashkent")).toBe("2026-11-15");
    expect(dayKey(new Date("2026-11-14T18:30:00Z"), "Asia/Tashkent")).toBe("2026-11-14");
  });
});

describe("day arithmetic", () => {
  it("adds days across month and year borders", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("measures the distance between two days", () => {
    expect(diffDays("2026-11-10", "2026-11-14")).toBe(4);
    expect(diffDays("2026-11-14", "2026-11-10")).toBe(-4);
  });

  it("lists the last days oldest first", () => {
    expect(lastDays("2026-11-14", 3)).toEqual(["2026-11-12", "2026-11-13", "2026-11-14"]);
  });
});

describe("computeStreak", () => {
  const today = "2026-11-14";

  it("is zero without activity", () => {
    expect(computeStreak([], today)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak(["2026-11-14", "2026-11-13", "2026-11-12"], today)).toBe(3);
  });

  it("stays alive when today has no session yet", () => {
    expect(computeStreak(["2026-11-13", "2026-11-12"], today)).toBe(2);
  });

  it("breaks after a missed day", () => {
    expect(computeStreak(["2026-11-12", "2026-11-11"], today)).toBe(0);
    expect(computeStreak(["2026-11-14", "2026-11-12"], today)).toBe(1);
  });
});
