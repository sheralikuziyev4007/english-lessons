"use client";

import { Mic } from "lucide-react";

import type { Word } from "@/features/content";
import { useListen, type ListenState } from "@/features/learning/hooks/use-listen";
import { matchesSpokenWord } from "@/features/learning/lib/spoken-match";
import { useT } from "@/hooks/use-t";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SpeakCheckProps {
  word: Word;
  learnerName: string;
}

function getMessage(state: ListenState, t: Dictionary): string {
  switch (state.status) {
    case "idle":
      return t.session.speakHint;
    case "listening":
      return t.session.listening;
    case "heard":
      return `${t.session.heard(state.guesses[0] ?? "")} ${t.session.speakAgain}`;
    case "failed":
      if (state.reason === "blocked") return t.session.micBlocked;
      if (state.reason === "no-speech") return t.session.noSpeech;
      return t.session.speechFailed;
  }
}

/**
 * Optional speaking practice on a new-word card: the child says the word and
 * the browser checks what it heard. It never blocks the lesson and is not
 * scored, because speech recognition can mishear a correct answer.
 */
export function SpeakCheck({ word, learnerName }: SpeakCheckProps) {
  const t = useT();
  const { state, start } = useListen();

  const isListening = state.status === "listening";
  const hasTried = state.status === "heard" || state.status === "failed";
  const isCorrect = state.status === "heard" && matchesSpokenWord(word.en, state.guesses);

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-center gap-4 rounded-3xl border-2 p-4",
        isCorrect ? "border-mint bg-mint-soft" : "border-line bg-paper",
      )}
    >
      <button
        type="button"
        data-testid="speak-button"
        disabled={isListening}
        aria-label={hasTried ? t.session.speakRetry : t.session.speakButton}
        onClick={start}
        className={cn(
          "focus-visible:outline-ink inline-flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 active:translate-y-1 active:shadow-none disabled:cursor-default",
          isCorrect
            ? "bg-mint shadow-[0_4px_0_var(--color-mint-dark)]"
            : "bg-coral shadow-[0_4px_0_var(--color-coral-dark)]",
          isListening && "animate-pulse",
        )}
      >
        <Mic className="size-8" aria-hidden="true" />
      </button>
      <p
        role="status"
        data-testid="speak-status"
        data-status={isCorrect ? "correct" : state.status}
        className="min-w-0 font-bold break-words"
      >
        {isCorrect ? t.session.speakCorrect(learnerName) : getMessage(state, t)}
      </p>
    </div>
  );
}
