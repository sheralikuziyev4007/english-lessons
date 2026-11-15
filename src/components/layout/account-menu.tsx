"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { useAppState } from "@/features/progress/hooks/use-app-state";
import { useT } from "@/hooks/use-t";

/** Shows who is logged in and lets them switch to another account. */
export function AccountMenu() {
  const t = useT();
  const { data } = useAppState();
  const logout = useLogout();

  if (!data) return null;

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span
        data-testid="account-name"
        className="hidden max-w-32 truncate text-sm font-extrabold sm:inline"
      >
        {data.account.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t.common.logoutAs(data.account.name)}
        title={t.common.logoutAs(data.account.name)}
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <LogOut className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
