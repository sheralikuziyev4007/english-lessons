"use client";

import { useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountDetail } from "@/features/admin/components/account-detail";
import { AccountsList } from "@/features/admin/components/accounts-list";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { useAccounts, useAdminLogout } from "@/features/admin/hooks/use-admin";
import type { AccountsList as AccountsListData } from "@/features/admin/types";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function AdminSkeleton() {
  const t = useT();
  return (
    <div role="status" aria-label={t.common.loading} className="flex flex-col gap-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  );
}

function AdminDashboard({ list }: { list: AccountsListData }) {
  const t = useT();
  const logout = useAdminLogout();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black sm:text-4xl">{t.admin.title}</h1>
        <Button
          variant="secondary"
          size="sm"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          {t.admin.lock}
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* On small screens the list and the selected account are separate views. */}
        <div className={cn(selectedId !== null && "hidden lg:block")}>
          <AccountsList
            accounts={list.accounts}
            total={list.total}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        {selectedId === null ? (
          <p className="border-line text-ink-soft hidden rounded-3xl border-2 border-dashed p-10 text-center font-bold lg:block">
            {t.admin.selectAccount}
          </p>
        ) : (
          <AccountDetail
            key={selectedId}
            accountId={selectedId}
            onBack={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

function AdminContent() {
  const { data, isError, error, refetch } = useAccounts();

  if (data) return <AdminDashboard list={data} />;
  if (isApiError(error, 403)) return <AdminLoginForm />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  return <AdminSkeleton />;
}

export function AdminScreen() {
  return (
    <>
      <AppHeader showAccount={false} />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <AdminContent />
      </main>
    </>
  );
}
