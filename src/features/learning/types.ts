export type PromptKind = "visual" | "audio" | "word" | "translation" | "sentence";
export type OptionKind = "word" | "visual" | "translation";

interface ExerciseBase {
  id: string;
  /** True for a repeated question after a mistake; it does not affect the score. */
  retry?: boolean;
}

export interface ChoiceExercise extends ExerciseBase {
  type: "choice";
  wordId: string;
  prompt: PromptKind;
  option: OptionKind;
  optionIds: string[];
}

export interface BuildExercise extends ExerciseBase {
  type: "build";
  wordId: string;
  letters: string[];
}

export interface TypeExercise extends ExerciseBase {
  type: "type";
  wordId: string;
}

export interface MatchExercise extends ExerciseBase {
  type: "match";
  wordIds: string[];
  /** Display order of the right-hand (word) column. */
  shuffledIds: string[];
}

export type Exercise = ChoiceExercise | BuildExercise | TypeExercise | MatchExercise;

export interface GenerateOptions {
  rng: () => number;
  allowAudio: boolean;
  allowTyping: boolean;
}
