"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountSettings } from "@/features/admin/components/account-settings";
import { VipBadge } from "@/features/admin/components/vip-badge";
import {
  useAccountOverview,
  useAdminOverviewActions,
} from "@/features/admin/hooks/use-admin";
import { OverviewActionsProvider } from "@/features/overview/actions-context";
import { OverviewSections } from "@/features/overview/components/overview-sections";
import { useT } from "@/hooks/use-t";
import { dayKey, formatDayKey } from "@/lib/dates";

interface AccountDetailProps {
  accountId: number;
  onBack: () => void;
}

/** One account's results, prizes, plan and private comment. */
export function AccountDetail({ accountId, onBack }: AccountDetailProps) {
  const t = useT();
  const { data, isError, refetch } = useAccountOverview(accountId);
  const actions = useAdminOverviewActions(accountId);

  const backButton = (
    <Button variant="ghost" size="sm" className="self-start lg:hidden" onClick={onBack}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t.admin.backToList}
    </Button>
  );

  if (isError && !data) {
    return (
      <div className="flex flex-col gap-3">
        {backButton}
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!data) {
    return (
      <div role="status" aria-label={t.common.loading} className="flex flex-col gap-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { account } = data;

  return (
    <section
      data-testid="account-detail"
      aria-labelledby="account-title"
      className="flex min-w-0 flex-col gap-5"
    >
      {backButton}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="account-title" className="text-3xl font-black break-words">
            {account.name}
          </h2>
          {account.isVip && <VipBadge />}
        </div>
        <p className="text-ink-soft text-sm font-bold">
          {t.admin.registered(formatDayKey(dayKey(new Date(account.createdAt))))}
        </p>
      </div>

      <AccountSettings account={account} />
      <OverviewActionsProvider actions={actions}>
        <OverviewSections overview={data} />
      </OverviewActionsProvider>
    </section>
  );
}
