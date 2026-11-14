import { DICTIONARIES, type Dictionary, type Locale } from "@/lib/i18n";
import { useLocaleStore } from "@/store/locale-store";

/** Returns the dictionary for the current interface language. */
export function useT(): Dictionary {
  const locale = useLocaleStore((state) => state.locale);
  return DICTIONARIES[locale];
}

export function useLocale(): Locale {
  return useLocaleStore((state) => state.locale);
}
