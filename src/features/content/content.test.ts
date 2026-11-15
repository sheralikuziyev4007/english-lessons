import { describe, expect, it } from "vitest";

import {
  ALL_LESSONS,
  ALL_WORDS,
  getUnitLessons,
  STAGES,
  UNITS,
} from "@/features/content";
import { LESSONS_PER_UNIT } from "@/lib/constants";

describe("course content", () => {
  it("has globally unique word ids", () => {
    const ids = ALL_WORDS.map((word) => word.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses single lowercase words so they can be spelled letter by letter", () => {
    for (const word of ALL_WORDS) {
      expect(word.en, word.id).toMatch(/^[a-z]+$/);
      expect(word.uz.trim().length, word.id).toBeGreaterThan(0);
    }
  });

  it("never repeats a picture or a translation inside one unit", () => {
    for (const unit of UNITS) {
      const pictures = unit.words.map(
        (word) => `${word.visual.kind}:${word.visual.value}`,
      );
      const meanings = unit.words.map((word) => word.uz);
      expect(new Set(pictures).size, unit.id).toBe(unit.words.length);
      expect(new Set(meanings).size, unit.id).toBe(unit.words.length);
    }
  });

  it("splits every unit into lessons that cover all of its words", () => {
    for (const unit of UNITS) {
      const lessons = getUnitLessons(unit.id);
      expect(lessons, unit.id).toHaveLength(LESSONS_PER_UNIT);
      expect(lessons.flatMap((lesson) => lesson.wordIds)).toEqual(
        unit.words.map((word) => word.id),
      );
    }
    expect(ALL_LESSONS).toHaveLength(UNITS.length * LESSONS_PER_UNIT);
  });

  it("never repeats a picture or a translation anywhere in the course", () => {
    // A question shows one picture or meaning and asks for the word, so two
    // words must never share one: both would be correct answers.
    const pictures = ALL_WORDS.map((word) => `${word.visual.kind}:${word.visual.value}`);
    const meanings = ALL_WORDS.map((word) => word.uz);
    const repeated = (items: string[]) =>
      items.filter((item, index) => items.indexOf(item) !== index);

    expect(repeated(pictures)).toEqual([]);
    expect(repeated(meanings)).toEqual([]);
  });

  it("has unique unit ids across all stages", () => {
    const ids = UNITS.map((unit) => unit.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("makes Movers twice as long as Starters", () => {
    const [starters, movers] = STAGES;
    expect(starters.units).toHaveLength(12);
    expect(movers.units).toHaveLength(starters.units.length * 2);
  });

  it("gives every Movers word a sentence with exactly one gap", () => {
    const movers = STAGES[1].units.flatMap((unit) => unit.words);
    for (const word of movers) {
      const sentence = word.sentence ?? "";
      expect(sentence.split("___"), word.id).toHaveLength(2);
      // The sentence must not give the answer away.
      expect(sentence.toLowerCase().split(/[^a-z]+/), word.id).not.toContain(word.en);
    }
  });
});
