import { describe, expect, it } from "vitest";

import { computeScore, computeStars, nextSrsState } from "@/lib/scoring";

describe("computeScore", () => {
  it("returns a rounded percentage", () => {
    expect(computeScore(2, 3)).toBe(67);
    expect(computeScore(12, 12)).toBe(100);
    expect(computeScore(0, 0)).toBe(0);
  });
});

describe("computeStars", () => {
  it("maps scores to one, two or three stars", () => {
    expect(computeStars(100)).toBe(3);
    expect(computeStars(90)).toBe(3);
    expect(computeStars(89)).toBe(2);
    expect(computeStars(70)).toBe(2);
    expect(computeStars(69)).toBe(1);
  });
});

describe("nextSrsState", () => {
  const today = "2026-11-14";

  it("puts a new word in box 1, due tomorrow", () => {
    expect(nextSrsState(0, true, today)).toEqual({ box: 1, dueDay: "2026-11-15" });
  });

  it("moves a known word up with a longer interval", () => {
    expect(nextSrsState(2, true, today)).toEqual({ box: 3, dueDay: "2026-11-18" });
  });

  it("never goes above the last box", () => {
    expect(nextSrsState(5, true, today)).toEqual({ box: 5, dueDay: "2026-11-30" });
  });

  it("sends a missed word back to box 1", () => {
    expect(nextSrsState(4, false, today)).toEqual({ box: 1, dueDay: "2026-11-15" });
  });
});
