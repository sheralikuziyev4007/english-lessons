import { UNITS } from "@/features/content/data/units";
import type { Lesson, Unit, Word } from "@/features/content/types";
import { LESSONS_PER_UNIT } from "@/lib/constants";
import { chunk } from "@/lib/utils";

export { UNITS };
export type { Lesson, LocalizedText, Unit, Visual, Word } from "@/features/content/types";

function buildLessons(unit: Unit): Lesson[] {
  const size = Math.ceil(unit.words.length / LESSONS_PER_UNIT);
  return chunk(unit.words, size).map((words, index) => ({
    id: `${unit.id}-${index + 1}`,
    unitId: unit.id,
    number: index + 1,
    wordIds: words.map((word) => word.id),
  }));
}

const LESSONS_BY_UNIT = new Map<string, Lesson[]>(
  UNITS.map((unit) => [unit.id, buildLessons(unit)]),
);

/** Every lesson of the course in learning order. */
export const ALL_LESSONS: Lesson[] = UNITS.flatMap(
  (unit) => LESSONS_BY_UNIT.get(unit.id) ?? [],
);

export const ALL_WORDS: Word[] = UNITS.flatMap((unit) => unit.words);

const WORDS_BY_ID = new Map<string, Word>(ALL_WORDS.map((word) => [word.id, word]));
const UNITS_BY_ID = new Map<string, Unit>(UNITS.map((unit) => [unit.id, unit]));
const LESSONS_BY_ID = new Map<string, Lesson>(
  ALL_LESSONS.map((lesson) => [lesson.id, lesson]),
);
const UNIT_ID_BY_WORD = new Map<string, string>(
  UNITS.flatMap((unit) => unit.words.map((word) => [word.id, unit.id] as const)),
);

export function getUnit(unitId: string): Unit | undefined {
  return UNITS_BY_ID.get(unitId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  return LESSONS_BY_ID.get(lessonId);
}

export function getWord(wordId: string): Word | undefined {
  return WORDS_BY_ID.get(wordId);
}

export function getUnitLessons(unitId: string): Lesson[] {
  return LESSONS_BY_UNIT.get(unitId) ?? [];
}

export function getUnitIdOfWord(wordId: string): string | undefined {
  return UNIT_ID_BY_WORD.get(wordId);
}

export function getWords(wordIds: readonly string[]): Word[] {
  return wordIds.flatMap((id) => {
    const word = WORDS_BY_ID.get(id);
    return word ? [word] : [];
  });
}
