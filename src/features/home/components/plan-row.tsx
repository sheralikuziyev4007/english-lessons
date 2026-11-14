import { Circle, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

interface PlanRowProps {
  title: string;
  hint: string;
  done: boolean;
  doneLabel: string;
  notDoneLabel: string;
  action?: ReactNode;
}

export function PlanRow({
  title,
  hint,
  done,
  doneLabel,
  notDoneLabel,
  action,
}: PlanRowProps) {
  return (
    <li className="flex items-center gap-3 py-3">
      {done ? (
        <CircleCheck
          role="img"
          aria-label={doneLabel}
          className="text-mint size-8 shrink-0"
        />
      ) : (
        <Circle
          role="img"
          aria-label={notDoneLabel}
          className="text-ink/25 size-8 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-lg leading-tight font-black">{title}</p>
        <p className="text-ink-soft text-sm font-bold">{hint}</p>
      </div>
      {action}
    </li>
  );
}
