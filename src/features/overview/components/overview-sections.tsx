"use client";

import { Card } from "@/components/ui/card";
import { ActivityChart } from "@/features/overview/components/activity-chart";
import { HardWords } from "@/features/overview/components/hard-words";
import { OfflineTaskCard } from "@/features/overview/components/offline-task-card";
import { PrizeForm } from "@/features/overview/components/prize-form";
import { PrizeList } from "@/features/overview/components/prize-list";
import { RoadmapCard } from "@/features/overview/components/roadmap-card";
import { SummaryCards } from "@/features/overview/components/summary-cards";
import { TestsTable } from "@/features/overview/components/tests-table";
import type { Overview } from "@/features/overview/types";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

interface OverviewSectionsProps {
  overview: Overview;
  /** Two columns on wide screens; the admin's narrower pane uses one. */
  wide?: boolean;
}

/** One learner's results, prizes and daily task. Needs an OverviewActionsProvider. */
export function OverviewSections({ overview, wide = false }: OverviewSectionsProps) {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <SummaryCards overview={overview} />

      <Card role="region" aria-labelledby="prizes-title" className="flex flex-col gap-4">
        <h2 id="prizes-title" className="text-xl font-black">
          {t.overview.prizesTitle}
        </h2>
        <PrizeForm />
        <PrizeList prizes={overview.prizes} />
      </Card>

      <div className={cn("grid items-start gap-6", wide && "lg:grid-cols-2")}>
        <OfflineTaskCard state={overview.state} />
        <ActivityChart activity={overview.activity} />
        <RoadmapCard roadmap={overview.roadmap} />
        <HardWords words={overview.hardWords} />
      </div>

      <TestsTable state={overview.state} />
    </div>
  );
}
