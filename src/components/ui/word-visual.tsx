import type { Visual } from "@/features/content";
import { cn } from "@/lib/utils";

interface WordVisualProps {
  visual: Visual;
  /** Accessible name. Pass an empty string when the picture is decorative. */
  label: string;
  size?: "sm" | "md" | "lg";
}

const BOX = { sm: "size-12", md: "size-20", lg: "size-36" } as const;
const EMOJI = { sm: "text-4xl", md: "text-6xl", lg: "text-8xl" } as const;
const TEXT = { sm: "text-3xl", md: "text-5xl", lg: "text-7xl" } as const;

/** Renders a word's picture: an emoji, a colour swatch or a numeral. */
export function WordVisual({ visual, label, size = "md" }: WordVisualProps) {
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  const base = cn("inline-flex shrink-0 items-center justify-center", BOX[size]);

  if (visual.kind === "color") {
    return (
      <span
        {...a11y}
        className={cn(base, "border-ink/15 rounded-full border-4")}
        style={{ backgroundColor: visual.value }}
      />
    );
  }

  if (visual.kind === "text") {
    return (
      <span {...a11y} className={cn(base, "text-primary font-black", TEXT[size])}>
        {visual.value}
      </span>
    );
  }

  return (
    <span {...a11y} className={cn(base, "emoji", EMOJI[size])}>
      {visual.value}
    </span>
  );
}
