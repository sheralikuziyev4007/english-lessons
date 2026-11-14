import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  tone?: "primary" | "sun" | "mint";
  className?: string;
}

const TONES = { primary: "bg-primary", sun: "bg-sun-dark", mint: "bg-mint" } as const;

export function ProgressBar({
  value,
  max,
  label,
  tone = "primary",
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn("bg-ink/10 h-3 w-full overflow-hidden rounded-full", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", TONES[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
