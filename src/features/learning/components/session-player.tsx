"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { getWord, type Word } from "@/features/content";
import { BuildExercise } from "@/features/learning/components/build-exercise";
import { ChoiceExercise } from "@/features/learning/components/choice-exercise";
import { FeedbackBar } from "@/features/learning/components/feedback-bar";
import { IntroCard } from "@/features/learning/components/intro-card";
import { MatchExercise } from "@/features/learning/components/match-exercise";
import { ResultScreen } from "@/features/learning/components/result-screen";
import { SessionHeader } from "@/features/learning/components/session-header";
import { TypeExercise } from "@/features/learning/components/type-exercise";
import { useSessionPlayer } from "@/features/learning/hooks/use-session-player";
import { useSubmitSession } from "@/features/learning/hooks/use-submit-session";
import { speak } from "@/features/learning/lib/speech";
import type { Exercise } from "@/features/learning/types";
import type { SessionAnswer, SessionInput, SessionKind } from "@/features/progress/types";

interface SessionPlayerProps {
  title: string;
  kind: SessionKind;
  refId: string;
  /** The learner is addressed by name in feedback and on the result screen. */
  learnerName: string;
  /** New words shown as cards before the questions (lessons only). */
  introWords: Word[];
  exercises: Exercise[];
  /** Ask a missed question again at the end of the session. */
  requeueWrong: boolean;
  onRestart: () => void;
}

const MS_PER_SECOND = 1000;

function renderExercise(
  exercise: Exercise,
  locked: boolean,
  onAnswer: (results: SessionAnswer[]) => void,
) {
  switch (exercise.type) {
    case "choice":
      return <ChoiceExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
    case "build":
      return <BuildExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
    case "type":
      return <TypeExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
    case "match":
      return <MatchExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
  }
}

/** Runs one lesson, review or test from the first card to the saved result. */
export function SessionPlayer({
  title,
  kind,
  refId,
  learnerName,
  introWords,
  exercises,
  requeueWrong,
  onRestart,
}: SessionPlayerProps) {
  const [state, dispatch] = useSessionPlayer(exercises, introWords.length);
  const [startedAt] = useState(() => Date.now());
  const submit = useSubmitSession();

  const exercise = state.queue[state.index];
  const stepsDone = state.phase === "intro" ? state.introIndex : state.index;
  const stepsTotal = state.phase === "intro" ? introWords.length : state.queue.length;

  const buildInput = (): SessionInput => ({
    kind,
    refId,
    durationSec: Math.round((Date.now() - startedAt) / MS_PER_SECOND),
    answers: state.answers,
  });

  const handleAnswer = (results: SessionAnswer[]) => {
    dispatch({ type: "answer", results, requeueWrong });
    const word =
      exercise && exercise.type !== "match" ? getWord(exercise.wordId) : undefined;
    if (word) speak(word.en);
  };

  const handleContinue = () => {
    if (state.index + 1 >= state.queue.length) submit.mutate(buildInput());
    dispatch({ type: "continue" });
  };

  if (state.phase === "done") {
    return (
      <main id="main" className="flex flex-1 flex-col justify-center">
        <ResultScreen
          kind={kind}
          learnerName={learnerName}
          result={submit.data}
          isError={submit.isError}
          onRetrySave={() => submit.mutate(buildInput())}
          onRestart={onRestart}
        />
      </main>
    );
  }

  const introWord = introWords[state.introIndex];
  const stepKey =
    state.phase === "intro" ? `intro-${state.introIndex}` : (exercise?.id ?? "");

  return (
    <div className="flex flex-1 flex-col">
      <SessionHeader title={title} current={stepsDone} total={stepsTotal} />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* Enter animation only: an exiting question must never stay clickable. */}
        <motion.div
          key={stepKey}
          data-testid="step"
          data-step={stepKey}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
        >
          {state.phase === "intro" && introWord && (
            <IntroCard
              word={introWord}
              learnerName={learnerName}
              position={state.introIndex + 1}
              total={introWords.length}
              onNext={() =>
                dispatch({ type: "introNext", introCount: introWords.length })
              }
            />
          )}
          {state.phase === "play" &&
            exercise &&
            renderExercise(exercise, state.feedback !== null, handleAnswer)}
        </motion.div>
      </main>
      {state.feedback && (
        <FeedbackBar
          feedback={state.feedback}
          learnerName={learnerName}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
