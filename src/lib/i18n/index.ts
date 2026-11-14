import { en, type Dictionary } from "@/lib/i18n/en";
import { uz } from "@/lib/i18n/uz";

export type Locale = "uz" | "en";
export type { Dictionary };

export const DEFAULT_LOCALE: Locale = "uz";
export const LOCALES: readonly Locale[] = ["uz", "en"];
export const LOCALE_LABELS: Record<Locale, string> = { uz: "O'zbekcha", en: "English" };

export const DICTIONARIES: Record<Locale, Dictionary> = { uz, en };
