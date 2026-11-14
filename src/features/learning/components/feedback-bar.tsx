"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { getWord } from "@/features/content";
import type { Feedback } from "@/features/learning/hooks/use-session-player";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

interface FeedbackBarProps {
  feedback: Feedback;
  onContinue: () => void;
}

/** Tells the child whether the answer was right and shows the correct word. */
export function FeedbackBar({ feedback, onContinue }: FeedbackBarProps) {
  const t = useT();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const word = feedback.wordId ? getWord(feedback.wordId) : undefined;
  const Icon = feedback.correct ? CircleCheck : CircleX;

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      data-testid="feedback"
      data-correct={feedback.correct}
      className={cn(
        "sticky bottom-0 border-t-2",
        feedback.correct ? "border-mint bg-mint-soft" : "border-coral bg-coral-soft",
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="status" className="flex items-center gap-3">
          <Icon
            aria-hidden="true"
            className={cn(
              "size-9 shrink-0",
              feedback.correct ? "text-mint" : "text-coral",
            )}
          />
          <div>
            <p className="text-xl font-black">
              {feedback.correct ? t.session.correct : t.session.wrong}
            </p>
            {word && (
              <p className="font-bold">
                {!feedback.correct && <span>{t.session.answerIs} </span>}
                <span lang="en" className="font-black">
                  {word.en}
                </span>
                <span lang="uz"> — {word.uz}</span>
              </p>
            )}
          </div>
        </div>
        <Button
          ref={buttonRef}
          size="lg"
          variant={feedback.correct ? "success" : "danger"}
          className="sm:min-w-44"
          onClick={onContinue}
        >
          {t.common.continue}
        </Button>
      </div>
    </div>
  );
}
