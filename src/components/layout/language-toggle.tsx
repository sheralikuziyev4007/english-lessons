"use client";

import { useT } from "@/hooks/use-t";
import { LOCALE_LABELS, LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLocaleStore } from "@/store/locale-store";

export function LanguageToggle() {
  const t = useT();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className="border-line bg-paper flex rounded-xl border-2 p-0.5"
    >
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          lang={item}
          aria-pressed={locale === item}
          aria-label={LOCALE_LABELS[item]}
          onClick={() => setLocale(item)}
          className={cn(
            "focus-visible:outline-ink min-h-9 min-w-10 rounded-lg px-2 text-sm font-extrabold uppercase focus-visible:outline-3 focus-visible:outline-offset-2",
            locale === item
              ? "bg-primary text-white"
              : "text-ink-soft hover:bg-primary-soft",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
