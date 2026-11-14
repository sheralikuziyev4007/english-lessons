"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { ActivityChart } from "@/features/parent/components/activity-chart";
import { HardWords } from "@/features/parent/components/hard-words";
import { OfflineTaskCard } from "@/features/parent/components/offline-task-card";
import { PinForm } from "@/features/parent/components/pin-form";
import { PrizeForm } from "@/features/parent/components/prize-form";
import { PrizeList } from "@/features/parent/components/prize-list";
import { RoadmapCard } from "@/features/parent/components/roadmap-card";
import { SummaryCards } from "@/features/parent/components/summary-cards";
import { TestsTable } from "@/features/parent/components/tests-table";
import { useLockParent, useParentOverview } from "@/features/parent/hooks/use-parent";
import type { ParentOverview } from "@/features/parent/types";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";

function ParentSkeleton() {
  const t = useT();
  return (
    <div role="status" aria-label={t.common.loading} className="flex flex-col gap-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function ParentDashboard({ overview }: { overview: ParentOverview }) {
  const t = useT();
  const lock = useLockParent();
  const logout = useLogout();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black sm:text-4xl">{t.parent.title}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={lock.isPending}
            onClick={() => lock.mutate()}
          >
            {t.parent.lock}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            {t.common.logout}
          </Button>
        </div>
      </div>

      <SummaryCards overview={overview} />

      <Card role="region" aria-labelledby="prizes-title" className="flex flex-col gap-4">
        <h2 id="prizes-title" className="text-xl font-black">
          {t.parent.prizesTitle}
        </h2>
        <PrizeForm />
        <PrizeList prizes={overview.prizes} />
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <OfflineTaskCard state={overview.state} />
        <ActivityChart activity={overview.activity} />
        <RoadmapCard roadmap={overview.roadmap} />
        <HardWords words={overview.hardWords} />
      </div>

      <TestsTable state={overview.state} />
    </div>
  );
}

function ParentContent() {
  const { data, isError, error, refetch } = useParentOverview();

  if (data) return <ParentDashboard overview={data} />;
  if (isApiError(error, 403)) return <PinForm />;
  // A 401 triggers a redirect to the login page; keep the skeleton meanwhile.
  if (isError && !isApiError(error, 401))
    return <ErrorState onRetry={() => void refetch()} />;
  return <ParentSkeleton />;
}

export function ParentScreen() {
  return (
    <>
      <AppHeader showParentLink={false} />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <ParentContent />
      </main>
    </>
  );
}
