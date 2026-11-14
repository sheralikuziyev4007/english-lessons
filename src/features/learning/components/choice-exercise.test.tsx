import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChoiceExercise } from "@/features/learning/components/choice-exercise";
import type { ChoiceExercise as ChoiceExerciseData } from "@/features/learning/types";

const EXERCISE: ChoiceExerciseData = {
  id: "q1",
  type: "choice",
  wordId: "cat",
  prompt: "visual",
  option: "word",
  optionIds: ["dog", "cat", "fish"],
};

describe("ChoiceExercise", () => {
  it("shows the question, the picture and every option", () => {
    render(<ChoiceExercise exercise={EXERCISE} locked={false} onAnswer={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    // The picture is described by its meaning, never by the English answer.
    expect(screen.getByRole("img", { name: /mushuk/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("reports a correct answer", async () => {
    const onAnswer = vi.fn();
    render(<ChoiceExercise exercise={EXERCISE} locked={false} onAnswer={onAnswer} />);

    await userEvent.click(screen.getByRole("button", { name: "cat" }));
    expect(onAnswer).toHaveBeenCalledWith([{ wordId: "cat", correct: true }]);
  });

  it("reports a wrong answer", async () => {
    const onAnswer = vi.fn();
    render(<ChoiceExercise exercise={EXERCISE} locked={false} onAnswer={onAnswer} />);

    await userEvent.click(screen.getByRole("button", { name: "dog" }));
    expect(onAnswer).toHaveBeenCalledWith([{ wordId: "cat", correct: false }]);
  });

  it("ignores clicks once the answer is locked", async () => {
    const onAnswer = vi.fn();
    render(<ChoiceExercise exercise={EXERCISE} locked onAnswer={onAnswer} />);

    await userEvent.click(screen.getByRole("button", { name: "fish" }));
    expect(onAnswer).not.toHaveBeenCalled();
  });
});
