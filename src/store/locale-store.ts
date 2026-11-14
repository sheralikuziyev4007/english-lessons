import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * Interface language. Hydration from localStorage is triggered manually in
 * <Providers> so the first client render matches the prerendered HTML.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    { name: "starway-locale", skipHydration: true },
  ),
);
