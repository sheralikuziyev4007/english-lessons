"use client";

import { AppHeader } from "@/components/layout/app-header";
import { getStageIdOfUnit, STAGES } from "@/features/content";
import { DailyPlan } from "@/features/home/components/daily-plan";
import { HomeSkeleton } from "@/features/home/components/home-skeleton";
import { PrizeBanner } from "@/features/home/components/prize-banner";
import { StatsRow } from "@/features/home/components/stats-row";
import { StageSection } from "@/features/home/components/stage-section";
import { StateGate } from "@/features/progress/components/state-gate";
import { getNextStep } from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";

function HomeContent({ state }: { state: AppState }) {
  const t = useT();
  // The stage with the learner's next step is open; a finished course shows the last one.
  const next = getNextStep(state);
  const currentStageId =
    next.type === "finished"
      ? STAGES[STAGES.length - 1]?.id
      : getStageIdOfUnit(next.unit.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          data-testid="greeting"
          className="text-3xl font-black break-words sm:text-4xl"
        >
          {t.home.greeting(state.account.name)}
        </h1>
        <p className="text-ink-soft text-lg font-bold">{t.home.subtitle}</p>
      </div>
      <StatsRow state={state} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6 lg:sticky lg:top-22">
          {state.prize && <PrizeBanner prize={state.prize} state={state} />}
          <DailyPlan state={state} />
        </div>
        <section aria-labelledby="units-title" className="flex flex-col gap-3">
          <h2 id="units-title" className="text-xl font-black">
            {t.home.unitsTitle}
          </h2>
          {STAGES.map((stage, index) => (
            <StageSection
              key={stage.id}
              stage={stage}
              previousName={STAGES[index - 1]?.name ?? null}
              isCurrent={stage.id === currentStageId}
              state={state}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

export function HomeScreen() {
  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <StateGate skeleton={<HomeSkeleton />}>
          {(state) => <HomeContent state={state} />}
        </StateGate>
      </main>
    </>
  );
}
