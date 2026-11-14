import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const inputClassName =
  "min-h-12 w-full rounded-2xl border-2 border-line bg-paper px-4 text-base font-bold text-ink placeholder:font-semibold placeholder:text-ink-soft/70 focus-visible:border-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink aria-invalid:border-coral";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClassName, className)} {...props} />;
}
