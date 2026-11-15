"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewActionsProvider } from "@/features/overview/actions-context";
import { OverviewSections } from "@/features/overview/components/overview-sections";
import type { Overview } from "@/features/overview/types";
import { PinForm } from "@/features/parent/components/pin-form";
import {
  useLockParent,
  useParentOverview,
  useParentOverviewActions,
} from "@/features/parent/hooks/use-parent";
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

function ParentDashboard({ overview }: { overview: Overview }) {
  const t = useT();
  const lock = useLockParent();
  const actions = useParentOverviewActions();

  return (
    <div data-testid="parent-dashboard" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 text-3xl font-black break-words sm:text-4xl">
          {t.parent.title(overview.state.account.name)}
        </h1>
        <Button
          variant="secondary"
          size="sm"
          disabled={lock.isPending}
          onClick={() => lock.mutate(undefined)}
        >
          {t.parent.lock}
        </Button>
      </div>
      <OverviewActionsProvider actions={actions}>
        <OverviewSections overview={overview} wide />
      </OverviewActionsProvider>
    </div>
  );
}

function ParentContent() {
  const { data, isError, error, refetch } = useParentOverview();

  if (data) return <ParentDashboard overview={data} />;
  if (isApiError(error, 403)) {
    return <PinForm mode={error.code === "pin_not_set" ? "create" : "enter"} />;
  }
  // A 401 triggers a redirect to the login page; keep the skeleton meanwhile.
  if (isError && !isApiError(error, 401)) {
    return <ErrorState onRetry={() => void refetch()} />;
  }
  return <ParentSkeleton />;
}

/** The parent section of the logged-in account, behind that account's PIN. */
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
