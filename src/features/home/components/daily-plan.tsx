"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlanRow } from "@/features/home/components/plan-row";
import {
  getNextStep,
  isDailyLimitReached,
  type NextStep,
} from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";
import { ROUTES } from "@/lib/constants";
import { getOfflineTask } from "@/lib/offline-task";

interface StudyRow {
  title: string;
  hint: string;
  done: boolean;
  href: string | null;
}

function useStudyRow(state: AppState, next: NextStep): StudyRow {
  const t = useT();
  const localized = useLocalized();
  const done = state.todayStats.lessonDone;

  if (next.type === "finished") {
    return { title: t.home.planLesson, hint: t.home.courseDone, done: true, href: null };
  }
  if (next.type === "test") {
    return {
      title: t.home.test,
      hint: t.home.planTestHint(localized(next.unit.title)),
      done: false,
      href: ROUTES.test(next.unit.id),
    };
  }
  if (isDailyLimitReached(state)) {
    return { title: t.home.planLesson, hint: t.home.dailyLimit, done: true, href: null };
  }
  return {
    title: t.home.planLesson,
    hint: t.home.planLessonHint(localized(next.unit.title), next.lesson.number),
    done,
    href: ROUTES.lesson(next.lesson.id),
  };
}

/** Today's three tasks: a new lesson, word review and one task away from the screen. */
export function DailyPlan({ state }: { state: AppState }) {
  const t = useT();
  const study = useStudyRow(state, getNextStep(state));
  const dueCount = state.dueWordIds.length;
  const reviewDone = dueCount === 0;
  const task = getOfflineTask(t.offlineTasks, state.today);
  const allDone = study.done && reviewDone && state.todayStats.offlineDone;

  return (
    <Card data-testid="daily-plan" aria-labelledby="plan-title" role="region">
      <h2 id="plan-title" className="text-xl font-black">
        {t.home.todayTitle}
      </h2>
      <ul className="divide-line divide-y-2">
        <PlanRow
          title={study.title}
          hint={study.hint}
          done={study.done}
          doneLabel={t.home.done}
          notDoneLabel={t.home.notDone}
          action={
            study.href && (
              <Link
                href={study.href}
                data-testid="plan-study"
                className={buttonVariants({
                  variant: study.done ? "secondary" : "primary",
                })}
              >
                {t.home.start}
              </Link>
            )
          }
        />
        <PlanRow
          title={t.home.planReview}
          hint={reviewDone ? t.home.planReviewNone : t.home.planReviewCount(dueCount)}
          done={reviewDone}
          doneLabel={t.home.done}
          notDoneLabel={t.home.notDone}
          action={
            !reviewDone && (
              <Link
                href={ROUTES.review}
                data-testid="plan-review"
                className={buttonVariants({
                  variant: study.done ? "primary" : "secondary",
                })}
              >
                {t.home.start}
              </Link>
            )
          }
        />
        <PlanRow
          title={t.home.planOffline}
          hint={`${task} ${t.home.planOfflineHint}`}
          done={state.todayStats.offlineDone}
          doneLabel={t.home.done}
          notDoneLabel={t.home.notDone}
        />
      </ul>
      {allDone && (
        <p
          role="status"
          className="bg-mint-soft text-mint-dark mt-2 rounded-2xl p-3 font-extrabold"
        >
          {t.home.allDone}
        </p>
      )}
    </Card>
  );
}
