"use client";

import { useState } from "react";

import { getLesson, getUnit, getWords } from "@/features/content";
import { SessionGate } from "@/features/learning/components/session-gate";
import { SessionMessage } from "@/features/learning/components/session-message";
import { SessionRunner } from "@/features/learning/components/session-runner";
import { generateLessonExercises } from "@/features/learning/lib/generate-exercises";
import {
  isDailyLimitReached,
  isLessonDone,
  isLessonUnlocked,
} from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";
import { ROUTES } from "@/lib/constants";

type Access = "open" | "locked" | "limit" | "missing";

function getAccess(lessonId: string, state: AppState): Access {
  const lesson = getLesson(lessonId);
  if (!lesson) return "missing";
  if (!isLessonUnlocked(lesson, state)) return "locked";
  if (!isLessonDone(lesson.id, state) && isDailyLimitReached(state)) return "limit";
  return "open";
}

function LessonContent({ lessonId, state }: { lessonId: string; state: AppState }) {
  const t = useT();
  const localized = useLocalized();
  // Decided once: saving the result refreshes `state` while the result is on screen.
  const [access] = useState(() => getAccess(lessonId, state));
  const lesson = getLesson(lessonId);
  const unit = lesson ? getUnit(lesson.unitId) : undefined;

  if (access === "missing" || !lesson || !unit) {
    return (
      <SessionMessage
        icon="🧭"
        title={t.session.notFoundTitle}
        text={t.session.notFoundText}
      />
    );
  }
  if (access === "locked") {
    return (
      <SessionMessage
        icon="🔒"
        title={t.session.lockedTitle}
        text={t.session.lockedText}
      />
    );
  }
  if (access === "limit") {
    return (
      <SessionMessage
        icon="🌙"
        title={t.session.limitTitle}
        text={t.session.limitText}
        action={
          state.dueWordIds.length > 0
            ? { href: ROUTES.review, label: t.home.planReview }
            : undefined
        }
      />
    );
  }

  const words = getWords(lesson.wordIds);

  return (
    <SessionRunner
      title={t.session.lessonTitle(localized(unit.title), lesson.number)}
      kind="lesson"
      refId={lesson.id}
      learnerName={state.account.name}
      introWords={words}
      requeueWrong
      generate={(options) => generateLessonExercises(words, options)}
    />
  );
}

export function LessonScreen({ lessonId }: { lessonId: string }) {
  return (
    <SessionGate>
      {(state) => <LessonContent lessonId={lessonId} state={state} />}
    </SessionGate>
  );
}
