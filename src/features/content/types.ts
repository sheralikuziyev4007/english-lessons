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
}

export interface Unit {
  id: string;
  title: LocalizedText;
  icon: string;
  words: Word[];
}

export interface Lesson {
  id: string;
  unitId: string;
  /** 1-based position inside the unit. */
  number: number;
  wordIds: string[];
}
