"use client";

import { useState } from "react";

import { WordVisual } from "@/components/ui/word-visual";
import { getWord, type Word } from "@/features/content";
import { ExerciseFrame } from "@/features/learning/components/exercise-frame";
import { ListenButton } from "@/features/learning/components/listen-button";
import type { ChoiceExercise as ChoiceExerciseData } from "@/features/learning/types";
import type { SessionAnswer } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ChoiceExerciseProps {
  exercise: ChoiceExerciseData;
  locked: boolean;
  onAnswer: (results: SessionAnswer[]) => void;
}

function getTitle(exercise: ChoiceExerciseData, t: Dictionary): string {
  if (exercise.prompt === "audio") {
    return exercise.option === "visual"
      ? t.session.pickPicture
      : t.session.pickWordByAudio;
  }
  if (exercise.prompt === "word") return t.session.pickTranslation;
  if (exercise.prompt === "translation") return t.session.pickWordByTranslation;
  if (exercise.prompt === "sentence") return t.session.pickWordForSentence;
  return t.session.pickWord;
}

const BLANK = "___";

/** A sentence with a gap; the gap shows the word once the question is answered. */
function SentencePrompt({ word, revealed }: { word: Word; revealed: boolean }) {
  const t = useT();
  const [before, after = ""] = (word.sentence ?? BLANK).split(BLANK);

  return (
    <div className="flex flex-col items-center gap-3">
      <WordVisual visual={word.visual} label={t.session.pictureOf(word.uz)} />
      <p
        lang="en"
        data-testid="sentence"
        className="text-center text-2xl font-black sm:text-3xl"
      >
        {before}
        {revealed ? (
          <span className="text-mint underline decoration-4 underline-offset-4">
            {word.en}
          </span>
        ) : (
          <span
            role="img"
            aria-label={t.session.blank}
            className="border-ink mx-1 inline-block w-20 border-b-4 align-baseline"
          />
        )}
        {after}
      </p>
    </div>
  );
}

interface PromptProps {
  exercise: ChoiceExerciseData;
  word: Word;
  locked: boolean;
}

function Prompt({ exercise, word, locked }: PromptProps) {
  const t = useT();

  switch (exercise.prompt) {
    case "visual":
      return (
        <WordVisual visual={word.visual} label={t.session.pictureOf(word.uz)} size="lg" />
      );
    case "audio":
      return <ListenButton text={word.en} label={t.session.listen} size="lg" autoPlay />;
    case "word":
      return (
        <div className="flex items-center gap-3">
          <p lang="en" className="text-4xl font-black sm:text-5xl">
            {word.en}
          </p>
          <ListenButton text={word.en} label={t.session.listenTo(word.en)} />
        </div>
      );
    case "sentence":
      return <SentencePrompt word={word} revealed={locked} />;
    case "translation":
      return (
        <p lang="uz" className="text-center text-3xl font-black sm:text-4xl">
          {word.uz}
        </p>
      );
  }
}

export function ChoiceExercise({ exercise, locked, onAnswer }: ChoiceExerciseProps) {
  const t = useT();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const word = getWord(exercise.wordId);
  if (!word) return null;

  const handleSelect = (optionId: string) => {
    if (locked) return;
    setSelectedId(optionId);
    onAnswer([{ wordId: word.id, correct: optionId === word.id }]);
  };

  return (
    <ExerciseFrame title={getTitle(exercise, t)} type="choice" wordId={word.id}>
      <div className="flex min-h-36 items-center justify-center">
        <Prompt exercise={exercise} word={word} locked={locked} />
      </div>
      <ul
        className={cn(
          "grid w-full max-w-xl gap-3",
          exercise.option === "visual" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {exercise.optionIds.map((optionId) => {
          const option = getWord(optionId);
          if (!option) return null;
          const isAnswer = optionId === word.id;
          const isSelected = optionId === selectedId;

          return (
            <li key={optionId}>
              <button
                type="button"
                data-testid="option"
                data-option-id={optionId}
                aria-disabled={locked}
                onClick={() => handleSelect(optionId)}
                className={cn(
                  "border-line bg-paper focus-visible:outline-ink flex min-h-16 w-full cursor-pointer items-center justify-center rounded-2xl border-2 px-4 py-3 text-xl font-extrabold shadow-[0_4px_0_var(--color-line)] transition-transform focus-visible:outline-3 focus-visible:outline-offset-2",
                  !locked &&
                    "hover:bg-primary-soft active:translate-y-1 active:shadow-none",
                  locked && "cursor-default",
                  locked && isAnswer && "border-mint bg-mint-soft shadow-none",
                  locked &&
                    isSelected &&
                    !isAnswer &&
                    "border-coral bg-coral-soft shadow-none",
                )}
              >
                {exercise.option === "visual" ? (
                  <WordVisual visual={option.visual} label={option.uz} />
                ) : (
                  <span lang={exercise.option === "word" ? "en" : "uz"}>
                    {exercise.option === "word" ? option.en : option.uz}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </ExerciseFrame>
  );
}
