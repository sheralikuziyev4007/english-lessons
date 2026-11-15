"use client";

import { useState } from "react";

import type { Word } from "@/features/content";
import { SessionPlayer } from "@/features/learning/components/session-player";
import { isSpeechSupported } from "@/features/learning/lib/speech";
import type { Exercise, GenerateOptions } from "@/features/learning/types";
import type { SessionKind } from "@/features/progress/types";

interface SessionRunnerProps {
  title: string;
  kind: SessionKind;
  refId: string;
  learnerName: string;
  introWords: Word[];
  requeueWrong: boolean;
  generate: (options: GenerateOptions) => Exercise[];
}

/** Typing questions are only offered on devices with a mouse and keyboard. */
function getDeviceOptions(): GenerateOptions {
  return {
    rng: Math.random,
    allowAudio: isSpeechSupported(),
    allowTyping: window.matchMedia("(pointer: fine)").matches,
  };
}

function SessionAttempt({
  generate,
  onRestart,
  ...session
}: SessionRunnerProps & { onRestart: () => void }) {
  // Generated once per attempt so questions stay stable across re-renders.
  const [exercises] = useState(() => generate(getDeviceOptions()));
  return <SessionPlayer {...session} exercises={exercises} onRestart={onRestart} />;
}

/** Creates the questions on the device and restarts the session on "Try again". */
export function SessionRunner(props: SessionRunnerProps) {
  const [attempt, setAttempt] = useState(0);
  return (
    <SessionAttempt
      key={attempt}
      {...props}
      onRestart={() => setAttempt((value) => value + 1)}
    />
  );
}
