"use client";

import { useState } from "react";

import { getUnit } from "@/features/content";
import { SessionGate } from "@/features/learning/components/session-gate";
import { SessionMessage } from "@/features/learning/components/session-message";
import { SessionRunner } from "@/features/learning/components/session-runner";
import { generateTestExercises } from "@/features/learning/lib/generate-exercises";
import { isTestUnlocked } from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";

function TestContent({ unitId, state }: { unitId: string; state: AppState }) {
  const t = useT();
  const localized = useLocalized();
  const unit = getUnit(unitId);
  // Decided once: saving the result refreshes `state` while the result is on screen.
  const [unlocked] = useState(() => isTestUnlocked(unitId, state));

  if (!unit) {
    return (
      <SessionMessage
        icon="🧭"
        title={t.session.notFoundTitle}
        text={t.session.notFoundText}
      />
    );
  }
  if (!unlocked) {
    return (
      <SessionMessage
        icon="🔒"
        title={t.session.lockedTitle}
        text={t.session.lockedText}
      />
    );
  }

  return (
    <SessionRunner
      title={t.session.testTitle(localized(unit.title))}
      kind="test"
      refId={unit.id}
      introWords={[]}
      requeueWrong={false}
      generate={(options) => generateTestExercises(unit.words, options)}
    />
  );
}

export function TestScreen({ unitId }: { unitId: string }) {
  return (
    <SessionGate>{(state) => <TestContent unitId={unitId} state={state} />}</SessionGate>
  );
}
