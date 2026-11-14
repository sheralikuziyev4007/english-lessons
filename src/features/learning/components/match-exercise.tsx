"use client";

import { useState } from "react";

import { WordVisual } from "@/components/ui/word-visual";
import { getWords } from "@/features/content";
import { ExerciseFrame } from "@/features/learning/components/exercise-frame";
import type { MatchExercise as MatchExerciseData } from "@/features/learning/types";
import type { SessionAnswer } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

interface MatchExerciseProps {
  exercise: MatchExerciseData;
  locked: boolean;
  onAnswer: (results: SessionAnswer[]) => void;
}

type Side = "picture" | "word";

const CARD =
  "flex min-h-16 w-full cursor-pointer items-center justify-center rounded-2xl border-2 px-3 py-2 text-xl font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function MatchExercise({ exercise, locked, onAnswer }: MatchExerciseProps) {
  const t = useT();
  const [selected, setSelected] = useState<Record<Side, string | null>>({
    picture: null,
    word: null,
  });
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [shaking, setShaking] = useState(false);

  const pictures = getWords(exercise.wordIds);
  const words = getWords(exercise.shuffledIds);

  const handleSelect = (side: Side, wordId: string) => {
    if (locked || matched.includes(wordId)) return;
    const next = { ...selected, [side]: wordId };

    if (!next.picture || !next.word) {
      setSelected(next);
      return;
    }

    setSelected({ picture: null, word: null });

    if (next.picture !== next.word) {
      // Both words of a confused pair count as not yet known.
      setMistakes([...new Set([...mistakes, next.picture, next.word])]);
      setShaking(true);
      return;
    }

    const nextMatched = [...matched, next.picture];
    setMatched(nextMatched);
    if (nextMatched.length === exercise.wordIds.length) {
      onAnswer(
        exercise.wordIds.map((id) => ({ wordId: id, correct: !mistakes.includes(id) })),
      );
    }
  };

  const cardClass = (side: Side, wordId: string) =>
    cn(
      CARD,
      "border-line bg-paper shadow-[0_4px_0_var(--color-line)]",
      selected[side] === wordId && "border-primary bg-primary-soft",
      matched.includes(wordId) && "border-mint bg-mint-soft cursor-default shadow-none",
    );

  return (
    <ExerciseFrame title={t.session.match} type="match">
      <div
        onAnimationEnd={() => setShaking(false)}
        className={cn(
          "grid w-full max-w-xl grid-cols-2 gap-3",
          shaking && "animate-shake",
        )}
      >
        <ul className="flex flex-col gap-3">
          {pictures.map((word) => (
            <li key={word.id}>
              <button
                type="button"
                data-testid="match-picture"
                data-word-id={word.id}
                aria-pressed={selected.picture === word.id}
                aria-disabled={locked || matched.includes(word.id)}
                onClick={() => handleSelect("picture", word.id)}
                className={cardClass("picture", word.id)}
              >
                <WordVisual
                  visual={word.visual}
                  label={
                    matched.includes(word.id)
                      ? `${word.uz}, ${t.session.matched}`
                      : word.uz
                  }
                  size="sm"
                />
              </button>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-3">
          {words.map((word) => (
            <li key={word.id}>
              <button
                type="button"
                data-testid="match-word"
                data-word-id={word.id}
                lang="en"
                aria-pressed={selected.word === word.id}
                aria-disabled={locked || matched.includes(word.id)}
                onClick={() => handleSelect("word", word.id)}
                className={cardClass("word", word.id)}
              >
                {word.en}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ExerciseFrame>
  );
}
