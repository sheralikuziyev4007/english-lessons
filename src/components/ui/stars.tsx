import { Star } from "lucide-react";

import { MAX_STARS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StarsProps {
  count: number;
  /** Accessible name. Pass an empty string when the stars are decorative. */
  label: string;
  size?: "sm" | "lg";
}

const SIZES = { sm: "size-4", lg: "size-12" } as const;

export function Stars({ count, label, size = "sm" }: StarsProps) {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className="inline-flex gap-0.5"
    >
      {Array.from({ length: MAX_STARS }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            SIZES[size],
            index < count ? "fill-sun text-sun-dark" : "fill-ink/10 text-ink/20",
          )}
        />
      ))}
    </span>
  );
}
