"use client";

import { ChevronDown, Lock } from "lucide-react";
import { useState } from "react";

import type { Stage } from "@/features/content";
import { UnitCard } from "@/features/home/components/unit-card";
import { isTestPassed, isUnitUnlocked } from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";

interface StageSectionProps {
  stage: Stage;
  /** Name of the stage that has to be finished first, if any. */
  previousName: string | null;
  /** The stage the learner is working on is shown open. */
  isCurrent: boolean;
  state: AppState;
}

/** One level of the course (e.g. Movers) as a collapsible list of its units. */
export function StageSection({
  stage,
  previousName,
  isCurrent,
  state,
}: StageSectionProps) {
  const t = useT();
  const [open, setOpen] = useState(isCurrent);
  const firstUnit = stage.units[0];
  const unlocked = firstUnit ? isUnitUnlocked(firstUnit.id, state) : false;
  const finished = stage.units.filter((unit) => isTestPassed(unit.id, state)).length;

  return (
    <details
      data-testid="stage"
      data-stage={stage.id}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group"
    >
      <summary className="border-line bg-paper focus-visible:outline-ink flex cursor-pointer list-none items-center gap-3 rounded-2xl border-2 p-3 focus-visible:outline-3 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight font-black">
            {stage.name} · {stage.level}
          </h3>
          <p className="text-ink-soft text-sm font-bold">
            {unlocked || !previousName
              ? t.home.stageProgress(finished, stage.units.length)
              : t.home.stageLocked(previousName)}
          </p>
        </div>
        {!unlocked && <Lock className="text-ink/40 size-5 shrink-0" aria-hidden="true" />}
        <ChevronDown
          className="size-6 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ol className="mt-3 flex flex-col gap-3">
        {stage.units.map((unit, index) => (
          <UnitCard key={unit.id} unit={unit} position={index + 1} state={state} />
        ))}
      </ol>
    </details>
  );
}
