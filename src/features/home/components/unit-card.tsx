"use client";

import { Trophy } from "lucide-react";

import { Stars } from "@/components/ui/stars";
import { getUnitLessons, type Unit } from "@/features/content";
import { PathNode } from "@/features/home/components/path-node";
import {
  isLessonUnlocked,
  isTestPassed,
  isTestUnlocked,
  isUnitUnlocked,
} from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UnitCardProps {
  unit: Unit;
  position: number;
  state: AppState;
}

export function UnitCard({ unit, position, state }: UnitCardProps) {
  const t = useT();
  const localized = useLocalized();
  const unlocked = isUnitUnlocked(unit.id, state);
  const test = state.tests[unit.id];
  const titleId = `unit-${unit.id}`;

  return (
    <li
      data-testid="unit-card"
      data-unit-id={unit.id}
      className={cn(
        "border-line bg-paper rounded-3xl border-2 p-4",
        !unlocked && "bg-paper/60",
      )}
    >
      <section aria-labelledby={titleId} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn("emoji text-4xl", !unlocked && "opacity-40 grayscale")}
            aria-hidden="true"
          >
            {unit.icon}
          </span>
          <div className="min-w-0">
            <h4 id={titleId} className="text-lg leading-tight font-black">
              {position}. {localized(unit.title)}
            </h4>
            <p className="text-ink-soft text-sm font-bold">
              {t.home.wordsCount(unit.words.length)}
              {!unlocked && ` · ${t.home.locked}`}
            </p>
          </div>
        </div>
        <ol className="flex flex-wrap gap-2">
          {getUnitLessons(unit.id).map((lesson) => {
            const progress = state.lessons[lesson.id];
            return (
              <PathNode
                key={lesson.id}
                href={ROUTES.lesson(lesson.id)}
                label={t.home.lesson(lesson.number)}
                status={
                  progress
                    ? t.home.starsCount(progress.stars)
                    : isLessonUnlocked(lesson, state)
                      ? t.home.start
                      : t.home.locked
                }
                unlocked={isLessonUnlocked(lesson, state)}
                done={progress !== undefined}
                footer={progress && <Stars count={progress.stars} label="" />}
              >
                {lesson.number}
              </PathNode>
            );
          })}
          <PathNode
            href={ROUTES.test(unit.id)}
            label={t.home.test}
            status={
              test
                ? t.home.bestScore(test.bestScore)
                : isTestUnlocked(unit.id, state)
                  ? t.home.start
                  : t.home.locked
            }
            unlocked={isTestUnlocked(unit.id, state)}
            done={isTestPassed(unit.id, state)}
            footer={test && <span className="text-xs font-black">{test.bestScore}%</span>}
          >
            <Trophy className="size-6" aria-hidden="true" />
          </PathNode>
        </ol>
      </section>
    </li>
  );
}
