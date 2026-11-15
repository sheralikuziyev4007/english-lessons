"use client";

import { useState } from "react";

import { getWords } from "@/features/content";
import { SessionGate } from "@/features/learning/components/session-gate";
import { SessionMessage } from "@/features/learning/components/session-message";
import { SessionRunner } from "@/features/learning/components/session-runner";
import { generateReviewExercises } from "@/features/learning/lib/generate-exercises";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { REVIEW_BATCH_SIZE, REVIEW_REF_ID } from "@/lib/constants";

function ReviewContent({ state }: { state: AppState }) {
  const t = useT();
  // Snapshot of the due words: saving the result changes the live list.
  const [words] = useState(() => getWords(state.dueWordIds.slice(0, REVIEW_BATCH_SIZE)));

  if (words.length === 0) {
    return (
      <SessionMessage
        icon="🌟"
        title={t.session.reviewEmptyTitle}
        text={t.session.reviewEmptyText}
      />
    );
  }

  return (
    <SessionRunner
      title={t.session.reviewTitle}
      kind="review"
      refId={REVIEW_REF_ID}
      learnerName={state.account.name}
      introWords={[]}
      requeueWrong
      generate={(options) => generateReviewExercises(words, options)}
    />
  );
}

export function ReviewScreen() {
  return <SessionGate>{(state) => <ReviewContent state={state} />}</SessionGate>;
}
