"use client";

import { Volume2 } from "lucide-react";
import { useEffect } from "react";

import { speak } from "@/features/learning/lib/speech";
import { cn } from "@/lib/utils";

interface ListenButtonProps {
  text: string;
  label: string;
  size?: "md" | "lg";
  autoPlay?: boolean;
}

const SIZES = { md: "size-12", lg: "size-28" } as const;
const ICONS = { md: "size-6", lg: "size-14" } as const;

export function ListenButton({
  text,
  label,
  size = "md",
  autoPlay = false,
}: ListenButtonProps) {
  useEffect(() => {
    if (autoPlay) speak(text);
  }, [autoPlay, text]);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => speak(text)}
      className={cn(
        "bg-primary focus-visible:outline-ink inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-white shadow-[0_4px_0_var(--color-primary-dark)] transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 active:translate-y-1 active:shadow-none",
        SIZES[size],
      )}
    >
      <Volume2 className={ICONS[size]} aria-hidden="true" />
    </button>
  );
}
