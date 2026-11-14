"use client";

import { X } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useT } from "@/hooks/use-t";
import { ROUTES } from "@/lib/constants";

interface SessionHeaderProps {
  title: string;
  current: number;
  total: number;
}

export function SessionHeader({ title, current, total }: SessionHeaderProps) {
  const t = useT();

  return (
    <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-4">
      <Link
        href={ROUTES.home}
        aria-label={t.session.quit}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <X className="size-6" aria-hidden="true" />
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-ink-soft truncate text-sm font-extrabold">{title}</p>
        <ProgressBar
          value={current}
          max={total}
          label={t.session.progress(Math.min(current + 1, total), total)}
          tone="mint"
        />
      </div>
    </header>
  );
}
