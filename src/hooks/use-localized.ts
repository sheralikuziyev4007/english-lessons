import type { LocalizedText } from "@/features/content";
import { useLocale } from "@/hooks/use-t";

/** Returns a function that picks the current language from a `{ en, uz }` pair. */
export function useLocalized(): (text: LocalizedText) => string {
  const locale = useLocale();
  return (text) => text[locale];
}
