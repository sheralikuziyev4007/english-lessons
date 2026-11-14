import { Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PathNodeProps {
  href: string;
  label: string;
  /** Extra detail for assistive technology, e.g. "locked" or "2 of 3 stars". */
  status: string;
  unlocked: boolean;
  done: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

const CIRCLE =
  "flex size-14 items-center justify-center rounded-full border-2 text-xl font-black";

/** One step on the course path: a lesson or a unit test. */
export function PathNode({
  href,
  label,
  status,
  unlocked,
  done,
  children,
  footer,
}: PathNodeProps) {
  const accessibleName = `${label}, ${status}`;

  return (
    <li className="flex w-16 flex-col items-center gap-1">
      {unlocked ? (
        <Link
          href={href}
          aria-label={accessibleName}
          className={cn(
            CIRCLE,
            "focus-visible:outline-ink transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 active:translate-y-1 active:shadow-none",
            done
              ? "border-mint-dark bg-mint text-white shadow-[0_4px_0_var(--color-mint-dark)]"
              : "border-primary-dark bg-primary text-white shadow-[0_4px_0_var(--color-primary-dark)]",
          )}
        >
          {children}
        </Link>
      ) : (
        <span
          role="img"
          aria-label={accessibleName}
          className={cn(CIRCLE, "border-line bg-ink/5 text-ink/40")}
        >
          <Lock className="size-5" aria-hidden="true" />
        </span>
      )}
      <span className="text-ink-soft text-center text-xs leading-tight font-extrabold">
        {label}
      </span>
      <span className="flex h-4 items-center">{footer}</span>
    </li>
  );
}
