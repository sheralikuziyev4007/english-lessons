export type Visual =
  | { kind: "emoji"; value: string }
  | { kind: "color"; value: string }
  | { kind: "text"; value: string };

export interface LocalizedText {
  en: string;
  uz: string;
}

export interface Word {
  id: string;
  en: string;
  uz: string;
  visual: Visual;
  /** A short sentence for reading practice; `___` marks where the word goes. */
  sentence?: string;
}

export interface Unit {
  id: string;
  title: LocalizedText;
  icon: string;
  words: Word[];
}

export type StageId = "starters" | "movers";

/** A level of the course, e.g. Starters (Pre A1) or Movers (A1). */
export interface Stage {
  id: StageId;
  /** The Cambridge Young Learners name; the same in every language. */
  name: string;
  /** CEFR level. */
  level: string;
  units: Unit[];
}

export interface Lesson {
  id: string;
  unitId: string;
  /** 1-based position inside the unit. */
  number: number;
  wordIds: string[];
}
