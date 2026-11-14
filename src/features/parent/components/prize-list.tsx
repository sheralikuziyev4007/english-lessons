"use client";

import { Button } from "@/components/ui/button";
import { getUnit } from "@/features/content";
import { useUpdatePrize } from "@/features/parent/hooks/use-parent";
import type { Prize, PrizeStatus } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<PrizeStatus, string> = {
  active: "bg-primary-soft text-primary-dark",
  earned: "bg-sun-soft text-ink",
  given: "bg-mint-soft text-mint-dark",
  cancelled: "bg-ink/10 text-ink",
};

export function PrizeList({ prizes }: { prizes: Prize[] }) {
  const t = useT();
  const localized = useLocalized();
  const updatePrize = useUpdatePrize();

  if (prizes.length === 0) {
    return (
      <p className="text-ink-soft py-4 text-center font-bold">{t.parent.prizesEmpty}</p>
    );
  }

  return (
    <ul className="divide-line divide-y-2">
      {prizes.map((prize) => {
        const unit = getUnit(prize.unitId);
        return (
          <li
            key={prize.id}
            data-testid="prize-item"
            data-status={prize.status}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="text-lg leading-tight font-black break-words">
                {prize.title}
              </p>
              <p className="text-ink-soft text-sm font-bold">
                {unit ? localized(unit.title) : prize.unitId} ·{" "}
                {t.parent.prizeNeeds(prize.minScore)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-extrabold",
                  STATUS_STYLES[prize.status],
                )}
              >
                {t.parent.prizeStatus[prize.status]}
              </span>
              {prize.status === "earned" && (
                <Button
                  size="sm"
                  variant="success"
                  disabled={updatePrize.isPending}
                  onClick={() => updatePrize.mutate({ id: prize.id, action: "given" })}
                >
                  {t.parent.prizeGive}
                </Button>
              )}
              {prize.status === "active" && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={updatePrize.isPending}
                  onClick={() => updatePrize.mutate({ id: prize.id, action: "cancel" })}
                >
                  {t.parent.prizeCancel}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
