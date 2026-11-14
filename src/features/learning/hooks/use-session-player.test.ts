import { describe, expect, it } from "vitest";

import {
  createPlayerState,
  playerReducer,
  type PlayerState,
} from "@/features/learning/hooks/use-session-player";
import type { Exercise } from "@/features/learning/types";

const QUEUE: Exercise[] = [
  {
    id: "q1",
    type: "choice",
    wordId: "cat",
    prompt: "visual",
    option: "word",
    optionIds: ["cat", "dog"],
  },
  { id: "q2", type: "type", wordId: "dog" },
];

function answer(state: PlayerState, correct: boolean, requeueWrong = true): PlayerState {
  const exercise = state.queue[state.index];
  const wordId = exercise.type === "match" ? "" : exercise.wordId;
  return playerReducer(state, {
    type: "answer",
    results: [{ wordId, correct }],
    requeueWrong,
  });
}

describe("playerReducer", () => {
  it("shows the intro cards before the questions", () => {
    let state = createPlayerState(QUEUE, 2);
    expect(state.phase).toBe("intro");
    state = playerReducer(state, { type: "introNext", introCount: 2 });
    expect(state).toMatchObject({ phase: "intro", introIndex: 1 });
    state = playerReducer(state, { type: "introNext", introCount: 2 });
    expect(state.phase).toBe("play");
  });

  it("skips the intro when there are no new words", () => {
    expect(createPlayerState(QUEUE, 0).phase).toBe("play");
  });

  it("records answers and finishes after the last question", () => {
    let state = createPlayerState(QUEUE, 0);
    state = answer(state, true);
    expect(state.feedback).toEqual({ correct: true, wordId: "cat" });
    state = playerReducer(state, { type: "continue" });
    state = answer(state, true);
    state = playerReducer(state, { type: "continue" });

    expect(state.phase).toBe("done");
    expect(state.answers).toEqual([
      { wordId: "cat", correct: true },
      { wordId: "dog", correct: true },
    ]);
  });

  it("repeats a missed question once without counting the second try", () => {
    let state = createPlayerState(QUEUE, 0);
    state = answer(state, false);
    expect(state.queue).toHaveLength(3);
    expect(state.queue[2]).toMatchObject({ wordId: "cat", retry: true });

    state = playerReducer(state, { type: "continue" });
    state = answer(state, true);
    state = playerReducer(state, { type: "continue" });
    // The retry is missed again: it must not be queued a third time.
    state = answer(state, false);
    expect(state.queue).toHaveLength(3);
    state = playerReducer(state, { type: "continue" });

    expect(state.phase).toBe("done");
    expect(state.answers).toEqual([
      { wordId: "cat", correct: false },
      { wordId: "dog", correct: true },
    ]);
  });

  it("does not repeat questions in a test", () => {
    const state = answer(createPlayerState(QUEUE, 0), false, false);
    expect(state.queue).toHaveLength(2);
  });

  it("ignores a second answer while feedback is shown", () => {
    const first = answer(createPlayerState(QUEUE, 0), true);
    expect(answer(first, false)).toBe(first);
  });
});
