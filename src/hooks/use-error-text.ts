import { useT } from "@/hooks/use-t";
import type { Dictionary } from "@/lib/i18n";

type ErrorKey = keyof Dictionary["errors"];

/** Translates a validation message key (see the Zod schemas) into text. */
export function useErrorText(): (key: string | undefined) => string | undefined {
  const t = useT();
  return (key) => {
    if (!key) return undefined;
    return key in t.errors ? t.errors[key as ErrorKey] : t.errors.generic;
  };
}
