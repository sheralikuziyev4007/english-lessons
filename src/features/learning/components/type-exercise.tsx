"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWord } from "@/features/content";
import { ExerciseFrame } from "@/features/learning/components/exercise-frame";
import { SpellingPrompt } from "@/features/learning/components/spelling-prompt";
import type { TypeExercise as TypeExerciseData } from "@/features/learning/types";
import type { SessionAnswer } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";

interface TypeExerciseProps {
  exercise: TypeExerciseData;
  locked: boolean;
  onAnswer: (results: SessionAnswer[]) => void;
}

const INPUT_ID = "typed-answer";

export function TypeExercise({ exercise, locked, onAnswer }: TypeExerciseProps) {
  const t = useT();
  const [value, setValue] = useState("");
  const word = getWord(exercise.wordId);
  if (!word) return null;

  const normalized = value.trim().toLowerCase();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked || !normalized) return;
    onAnswer([{ wordId: word.id, correct: normalized === word.en.toLowerCase() }]);
  };

  return (
    <ExerciseFrame title={t.session.type} type="type" wordId={word.id}>
      <SpellingPrompt word={word} />
      <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3">
        <label htmlFor={INPUT_ID} className="sr-only">
          {t.session.typeLabel}
        </label>
        <Input
          id={INPUT_ID}
          data-testid="type-input"
          lang="en"
          value={value}
          readOnly={locked}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t.session.typePlaceholder}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-h-14 text-center text-2xl"
        />
        <Button type="submit" size="lg" disabled={locked || !normalized}>
          {t.session.check}
        </Button>
      </form>
    </ExerciseFrame>
  );
}
