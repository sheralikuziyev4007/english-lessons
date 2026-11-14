"use client";

import { AppHeader } from "@/components/layout/app-header";
import { UNITS } from "@/features/content";
import { DailyPlan } from "@/features/home/components/daily-plan";
import { HomeSkeleton } from "@/features/home/components/home-skeleton";
import { PrizeBanner } from "@/features/home/components/prize-banner";
import { StatsRow } from "@/features/home/components/stats-row";
import { UnitCard } from "@/features/home/components/unit-card";
import { StateGate } from "@/features/progress/components/state-gate";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";

const CHILD_NAME = process.env.NEXT_PUBLIC_CHILD_NAME ?? "";

function HomeContent({ state }: { state: AppState }) {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">{t.home.greeting(CHILD_NAME)}</h1>
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
          <ol className="flex flex-col gap-3">
            {UNITS.map((unit, index) => (
              <UnitCard key={unit.id} unit={unit} position={index + 1} state={state} />
            ))}
          </ol>
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
