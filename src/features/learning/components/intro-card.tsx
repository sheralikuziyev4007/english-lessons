"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WordVisual } from "@/components/ui/word-visual";
import type { Word } from "@/features/content";
import { ExerciseFrame } from "@/features/learning/components/exercise-frame";
import { ListenButton } from "@/features/learning/components/listen-button";
import { SpeakCheck } from "@/features/learning/components/speak-check";
import { isRecognitionSupported } from "@/features/learning/lib/speech-recognition";
import { useT } from "@/hooks/use-t";

interface IntroCardProps {
  word: Word;
  learnerName: string;
  position: number;
  total: number;
  onNext: () => void;
}

/** Presents a new word: picture, spelling, sound, meaning and optional speaking. */
export function IntroCard({
  word,
  learnerName,
  position,
  total,
  onNext,
}: IntroCardProps) {
  const t = useT();
  // Chrome, Edge and Safari can listen; elsewhere the card simply has no microphone.
  const [canListen] = useState(isRecognitionSupported);
  const isLast = position === total;

  return (
    <ExerciseFrame title={t.session.introTitle} type="intro" wordId={word.id}>
      <p className="text-ink-soft -mt-4 font-bold">
        {t.session.introCounter(position, total)}
      </p>
      <div className="border-line bg-paper flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border-2 p-6">
        <WordVisual visual={word.visual} label="" size="lg" />
        <div className="flex items-center gap-3">
          <p lang="en" className="text-4xl font-black sm:text-5xl">
            {word.en}
          </p>
          <ListenButton text={word.en} label={t.session.listenTo(word.en)} autoPlay />
        </div>
        <p lang="uz" className="text-ink-soft text-xl font-bold">
          {word.uz}
        </p>
      </div>
      {canListen && <SpeakCheck word={word} learnerName={learnerName} />}
      <Button size="lg" className="w-full max-w-sm" onClick={onNext}>
        {isLast ? t.session.startPractice : t.session.next}
      </Button>
    </ExerciseFrame>
  );
}
