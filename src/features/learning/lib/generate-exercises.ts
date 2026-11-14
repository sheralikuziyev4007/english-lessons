import { ALL_WORDS, getUnitIdOfWord, type Word } from "@/features/content";
import type {
  ChoiceExercise,
  Exercise,
  GenerateOptions,
  OptionKind,
  PromptKind,
} from "@/features/learning/types";
import {
  LESSON_OPTION_COUNT,
  MATCH_PAIR_COUNT,
  TEST_OPTION_COUNT,
  TEST_QUESTION_COUNT,
} from "@/lib/constants";
import { shuffle, type Rng } from "@/lib/utils";

type ChoiceVariant = readonly [PromptKind, OptionKind];

const PICTURE_TO_WORD: ChoiceVariant = ["visual", "word"];
const AUDIO_TO_PICTURE: ChoiceVariant = ["audio", "visual"];
const WORD_TO_MEANING: ChoiceVariant = ["word", "translation"];
const MEANING_TO_WORD: ChoiceVariant = ["translation", "word"];
const AUDIO_TO_WORD: ChoiceVariant = ["audio", "word"];

/** What the learner sees for an option; two options must never look the same. */
function optionFace(word: Word, kind: OptionKind): string {
  if (kind === "translation") return word.uz;
  if (kind === "visual") return `${word.visual.kind}:${word.visual.value}`;
  return word.en;
}

/**
 * Picks the answer options for a word. Distractors come from the words being
 * practised first, then the same unit, then the rest of the course.
 */
export function pickOptionIds(
  target: Word,
  preferred: readonly Word[],
  kind: OptionKind,
  count: number,
  rng: Rng,
): string[] {
  const unitId = getUnitIdOfWord(target.id);
  const sameUnit = ALL_WORDS.filter((word) => getUnitIdOfWord(word.id) === unitId);
  const candidates = [
    ...shuffle(preferred, rng),
    ...shuffle(sameUnit, rng),
    ...shuffle(ALL_WORDS, rng),
  ];

  const faces = new Set([optionFace(target, kind)]);
  const distractors: string[] = [];
  for (const candidate of candidates) {
    if (distractors.length >= count - 1) break;
    const face = optionFace(candidate, kind);
    if (candidate.id === target.id || faces.has(face)) continue;
    faces.add(face);
    distractors.push(candidate.id);
  }

  return shuffle([target.id, ...distractors], rng);
}

/** Shuffles the letters and makes sure the result is not already the answer. */
export function scrambleLetters(word: string, rng: Rng): string[] {
  const letters = [...word];
  if (new Set(letters).size < 2) return letters;
  let scrambled = shuffle(letters, rng);
  while (scrambled.join("") === word) {
    scrambled = shuffle(letters, rng);
  }
  return scrambled;
}

function createIdFactory(): () => string {
  let counter = 0;
  return () => {
    counter += 1;
    return `q${counter}`;
  };
}

function choice(
  nextId: () => string,
  word: Word,
  [prompt, option]: ChoiceVariant,
  preferred: readonly Word[],
  count: number,
  rng: Rng,
): ChoiceExercise {
  return {
    id: nextId(),
    type: "choice",
    wordId: word.id,
    prompt,
    option,
    optionIds: pickOptionIds(word, preferred, option, count, rng),
  };
}

function spelling(nextId: () => string, word: Word, typed: boolean, rng: Rng): Exercise {
  return typed
    ? { id: nextId(), type: "type", wordId: word.id }
    : {
        id: nextId(),
        type: "build",
        wordId: word.id,
        letters: scrambleLetters(word.en, rng),
      };
}

/**
 * A lesson: recognise each picture, then recognise by sound or meaning,
 * match the pairs, and finally spell each word.
 */
export function generateLessonExercises(
  words: readonly Word[],
  options: GenerateOptions,
): Exercise[] {
  const { rng, allowAudio, allowTyping } = options;
  const nextId = createIdFactory();
  const pick = (word: Word, variant: ChoiceVariant) =>
    choice(nextId, word, variant, words, LESSON_OPTION_COUNT, rng);

  const recognise = words.map((word) => pick(word, PICTURE_TO_WORD));
  const understand = shuffle(words, rng).map((word, index) =>
    pick(word, allowAudio && index % 2 === 0 ? AUDIO_TO_PICTURE : WORD_TO_MEANING),
  );
  const matchIds = shuffle(words, rng)
    .slice(0, MATCH_PAIR_COUNT)
    .map((word) => word.id);
  const spell = shuffle(words, rng).map((word, index) =>
    spelling(nextId, word, allowTyping && index % 2 === 1, rng),
  );

  return [
    ...recognise,
    ...understand,
    {
      id: nextId(),
      type: "match",
      wordIds: matchIds,
      shuffledIds: shuffle(matchIds, rng),
    },
    ...spell,
  ];
}

/** A review: one mixed question per due word. */
export function generateReviewExercises(
  words: readonly Word[],
  options: GenerateOptions,
): Exercise[] {
  const { rng, allowAudio, allowTyping } = options;
  const nextId = createIdFactory();
  const variants: ChoiceVariant[] = [PICTURE_TO_WORD, MEANING_TO_WORD];
  if (allowAudio) variants.push(AUDIO_TO_WORD);

  return shuffle(words, rng).map((word, index) => {
    const slot = index % (variants.length + 1);
    return slot === variants.length
      ? spelling(nextId, word, allowTyping, rng)
      : choice(nextId, word, variants[slot], words, LESSON_OPTION_COUNT, rng);
  });
}

/**
 * A unit test in the entrance-exam format: every question has three options.
 * Each unit word is asked at least once.
 */
export function generateTestExercises(
  words: readonly Word[],
  options: GenerateOptions,
): Exercise[] {
  const { rng, allowAudio } = options;
  const nextId = createIdFactory();
  const variants: ChoiceVariant[] = [PICTURE_TO_WORD, WORD_TO_MEANING, MEANING_TO_WORD];
  if (allowAudio) variants.push(AUDIO_TO_WORD);

  const extraCount = Math.max(0, TEST_QUESTION_COUNT - words.length);
  const asked = [...shuffle(words, rng), ...shuffle(words, rng).slice(0, extraCount)];

  return asked.map((word, index) =>
    choice(
      nextId,
      word,
      variants[index % variants.length],
      words,
      TEST_OPTION_COUNT,
      rng,
    ),
  );
}
