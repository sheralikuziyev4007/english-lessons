import { useReducer } from "react";

import type { Exercise } from "@/features/learning/types";
import type { SessionAnswer } from "@/features/progress/types";

export interface Feedback {
  correct: boolean;
  /** The word to reveal as the correct answer, if the question had one. */
  wordId: string | null;
}

export interface PlayerState {
  phase: "intro" | "play" | "done";
  introIndex: number;
  queue: Exercise[];
  index: number;
  /** First-attempt answers only; these are what the server scores. */
  answers: SessionAnswer[];
  feedback: Feedback | null;
}

export type PlayerAction =
  | { type: "introNext"; introCount: number }
  | { type: "answer"; results: SessionAnswer[]; requeueWrong: boolean }
  | { type: "continue" };

export function createPlayerState(queue: Exercise[], introCount: number): PlayerState {
  return {
    phase: introCount > 0 ? "intro" : "play",
    introIndex: 0,
    queue,
    index: 0,
    answers: [],
    feedback: null,
  };
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "introNext":
      return state.introIndex + 1 < action.introCount
        ? { ...state, introIndex: state.introIndex + 1 }
        : { ...state, phase: "play" };

    case "answer": {
      const exercise = state.queue[state.index];
      if (!exercise || state.feedback) return state;

      const correct = action.results.every((result) => result.correct);
      const repeat =
        !correct && action.requeueWrong && !exercise.retry && exercise.type !== "match";

      return {
        ...state,
        answers: exercise.retry ? state.answers : [...state.answers, ...action.results],
        queue: repeat
          ? [...state.queue, { ...exercise, id: `${exercise.id}-retry`, retry: true }]
          : state.queue,
        feedback: { correct, wordId: exercise.type === "match" ? null : exercise.wordId },
      };
    }

    case "continue": {
      const index = state.index + 1;
      return index >= state.queue.length
        ? { ...state, feedback: null, phase: "done" }
        : { ...state, feedback: null, index };
    }
  }
}

export function useSessionPlayer(queue: Exercise[], introCount: number) {
  return useReducer(playerReducer, undefined, () => createPlayerState(queue, introCount));
}
