import { describe, expect, it } from "vitest";

import { getUnit, getWord, getWords, UNITS } from "@/features/content";
import {
  generateLessonExercises,
  generateReviewExercises,
  generateTestExercises,
  pickOptionIds,
  scrambleLetters,
} from "@/features/learning/lib/generate-exercises";
import type {
  ChoiceExercise,
  Exercise,
  GenerateOptions,
} from "@/features/learning/types";
import {
  LESSON_OPTION_COUNT,
  TEST_OPTION_COUNT,
  TEST_QUESTION_COUNT,
} from "@/lib/constants";
import { createRng } from "@/lib/utils";

const SEEDS = [1, 2, 3, 42, 2026];

function options(
  seed: number,
  overrides: Partial<GenerateOptions> = {},
): GenerateOptions {
  return { rng: createRng(seed), allowAudio: true, allowTyping: true, ...overrides };
}

function choices(exercises: Exercise[]): ChoiceExercise[] {
  return exercises.filter(
    (exercise): exercise is ChoiceExercise => exercise.type === "choice",
  );
}

function optionFaces(exercise: ChoiceExercise): string[] {
  return exercise.optionIds.map((id) => {
    const word = getWord(id);
    if (!word) throw new Error(`Unknown option ${id}`);
    if (exercise.option === "translation") return word.uz;
    if (exercise.option === "visual") return `${word.visual.kind}:${word.visual.value}`;
    return word.en;
  });
}

describe("pickOptionIds", () => {
  it("always includes the answer and never shows two identical options", () => {
    for (const unit of UNITS) {
      for (const word of unit.words) {
        for (const kind of ["word", "visual", "translation"] as const) {
          const ids = pickOptionIds(
            word,
            unit.words,
            kind,
            LESSON_OPTION_COUNT,
            createRng(7),
          );
          expect(ids).toContain(word.id);
          expect(ids).toHaveLength(LESSON_OPTION_COUNT);
          expect(new Set(ids).size).toBe(ids.length);
        }
      }
    }
  });
});

describe("scrambleLetters", () => {
  it("keeps the same letters but changes their order", () => {
    for (const seed of SEEDS) {
      const letters = scrambleLetters("giraffe", createRng(seed));
      expect([...letters].sort()).toEqual([..."giraffe"].sort());
      expect(letters.join("")).not.toBe("giraffe");
    }
  });
});

describe("generateLessonExercises", () => {
  const words = getWords(["red", "blue", "green", "yellow", "orange"]);

  it("practises every word in every round and ends with spelling", () => {
    for (const seed of SEEDS) {
      const exercises = generateLessonExercises(words, options(seed));
      // 5 picture questions + 5 sound/meaning questions + 1 match + 5 spelling.
      expect(exercises).toHaveLength(16);
      expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(
        exercises.length,
      );

      const spelling = exercises.filter(
        (exercise) => exercise.type === "build" || exercise.type === "type",
      );
      expect(spelling.map((exercise) => exercise.wordId).sort()).toEqual(
        words.map((word) => word.id).sort(),
      );

      for (const exercise of choices(exercises)) {
        expect(exercise.optionIds).toContain(exercise.wordId);
        expect(new Set(optionFaces(exercise)).size).toBe(exercise.optionIds.length);
      }
    }
  });

  it("respects the device: no audio and no typing questions when unavailable", () => {
    const exercises = generateLessonExercises(
      words,
      options(5, { allowAudio: false, allowTyping: false }),
    );
    expect(choices(exercises).some((exercise) => exercise.prompt === "audio")).toBe(
      false,
    );
    expect(exercises.some((exercise) => exercise.type === "type")).toBe(false);
  });
});

describe("generateTestExercises", () => {
  it("asks every unit word in the three-option exam format", () => {
    for (const unit of UNITS) {
      const exercises = generateTestExercises(unit.words, options(11));
      const asked = choices(exercises);

      expect(asked).toHaveLength(Math.max(TEST_QUESTION_COUNT, unit.words.length));
      expect(new Set(asked.map((exercise) => exercise.wordId)).size).toBe(
        unit.words.length,
      );
      for (const exercise of asked) {
        expect(exercise.optionIds).toHaveLength(TEST_OPTION_COUNT);
        expect(exercise.optionIds).toContain(exercise.wordId);
      }
    }
  });
});

describe("generateReviewExercises", () => {
  it("asks each due word exactly once", () => {
    const words = [
      ...(getUnit("animals")?.words ?? []),
      ...(getUnit("food")?.words ?? []),
    ];
    const exercises = generateReviewExercises(words, options(3));

    expect(exercises).toHaveLength(words.length);
    const asked = exercises.map((exercise) =>
      exercise.type === "match" ? "" : exercise.wordId,
    );
    expect(asked.sort()).toEqual(words.map((word) => word.id).sort());
  });
});
