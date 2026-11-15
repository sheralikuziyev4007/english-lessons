"use client";

import { VipBadge } from "@/features/admin/components/vip-badge";
import type { AccountSummary } from "@/features/admin/types";
import { TOTAL_LESSONS } from "@/features/progress/lib/unlock";
import { useT } from "@/hooks/use-t";
import { dayKey, formatDayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface AccountsListProps {
  accounts: AccountSummary[];
  total: number;
  selectedId: number | null;
  onSelect: (accountId: number) => void;
}

/** Every registered account with a one-line activity summary. */
export function AccountsList({
  accounts,
  total,
  selectedId,
  onSelect,
}: AccountsListProps) {
  const t = useT();

  return (
    <section aria-labelledby="accounts-title" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="accounts-title" className="text-xl font-black">
          {t.admin.accountsTitle}
        </h2>
        <p data-testid="accounts-count" className="text-ink-soft text-sm font-extrabold">
          {t.admin.accountsCount(total)}
        </p>
      </div>
      {accounts.length === 0 ? (
        <p className="border-line bg-paper text-ink-soft rounded-3xl border-2 p-6 text-center font-bold">
          {t.admin.accountsEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                data-testid="account-item"
                data-account-name={account.name}
                aria-current={account.id === selectedId ? "true" : undefined}
                onClick={() => onSelect(account.id)}
                className={cn(
                  "border-line bg-paper focus-visible:outline-ink hover:bg-primary-soft flex w-full cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2",
                  account.id === selectedId && "border-primary bg-primary-soft",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-lg leading-tight font-black">
                    {account.name}
                  </span>
                  {account.isVip && <VipBadge />}
                </span>
                <span className="text-ink-soft text-sm font-bold">
                  {t.admin.lessonsShort(account.lessonsDone, TOTAL_LESSONS)} ·{" "}
                  {account.lastActiveDay
                    ? t.admin.lastActive(formatDayKey(account.lastActiveDay))
                    : t.admin.neverActive}
                </span>
                <span className="text-ink-soft text-xs font-bold">
                  {t.admin.registered(formatDayKey(dayKey(new Date(account.createdAt))))}
                </span>
                {account.note && (
                  <span className="line-clamp-2 text-sm font-semibold break-words">
                    {account.note}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
