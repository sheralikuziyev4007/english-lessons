"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getWord } from "@/features/content";
import { ExerciseFrame } from "@/features/learning/components/exercise-frame";
import { SpellingPrompt } from "@/features/learning/components/spelling-prompt";
import type { BuildExercise as BuildExerciseData } from "@/features/learning/types";
import type { SessionAnswer } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

interface BuildExerciseProps {
  exercise: BuildExerciseData;
  locked: boolean;
  onAnswer: (results: SessionAnswer[]) => void;
}

const TILE =
  "inline-flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 text-2xl font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function BuildExercise({ exercise, locked, onAnswer }: BuildExerciseProps) {
  const t = useT();
  /** Indexes into `exercise.letters`, in the order the child tapped them. */
  const [picked, setPicked] = useState<number[]>([]);
  const word = getWord(exercise.wordId);
  if (!word) return null;

  const isComplete = picked.length === exercise.letters.length;
  const answer = picked.map((index) => exercise.letters[index]).join("");

  return (
    <ExerciseFrame title={t.session.build} type="build" wordId={word.id}>
      <SpellingPrompt word={word} />

      <div
        role="group"
        aria-label={t.session.yourWord}
        className="border-line flex min-h-16 w-full max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-2"
      >
        {picked.map((letterIndex, position) => (
          <button
            key={letterIndex}
            type="button"
            disabled={locked}
            aria-label={t.session.letter(exercise.letters[letterIndex])}
            onClick={() => setPicked(picked.filter((_, index) => index !== position))}
            className={cn(TILE, "border-primary bg-primary-soft")}
          >
            {exercise.letters[letterIndex]}
          </button>
        ))}
      </div>

      <div className="flex max-w-xl flex-wrap justify-center gap-2">
        {exercise.letters.map((letter, index) => (
          <button
            key={index}
            type="button"
            data-testid="tile"
            data-letter={letter}
            disabled={locked || picked.includes(index)}
            aria-label={t.session.letter(letter)}
            onClick={() => setPicked([...picked, index])}
            className={cn(
              TILE,
              "border-line bg-paper shadow-[0_3px_0_var(--color-line)] disabled:cursor-default disabled:opacity-30 disabled:shadow-none",
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="flex w-full max-w-xl gap-3">
        <Button
          variant="secondary"
          size="lg"
          disabled={locked || picked.length === 0}
          onClick={() => setPicked([])}
        >
          {t.session.clear}
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={locked || !isComplete}
          onClick={() => onAnswer([{ wordId: word.id, correct: answer === word.en }])}
        >
          {t.session.check}
        </Button>
      </div>
    </ExerciseFrame>
  );
}
