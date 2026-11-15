"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { getUnit } from "@/features/content";
import { getPrizeProgress } from "@/features/progress/lib/unlock";
import type { AppState, Prize } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";

interface PrizeBannerProps {
  prize: Prize;
  state: AppState;
}

/** The promised reward, with the steps left to earn it. */
export function PrizeBanner({ prize, state }: PrizeBannerProps) {
  const t = useT();
  const localized = useLocalized();
  const unit = getUnit(prize.unitId);
  const progress = getPrizeProgress(prize, state);

  if (prize.status === "earned") {
    return (
      <section
        data-testid="prize-banner"
        aria-labelledby="prize-title"
        className="border-sun-dark bg-sun-soft rounded-3xl border-2 p-5 text-center"
      >
        <span className="emoji text-6xl" aria-hidden="true">
          🎉
        </span>
        <h2 id="prize-title" className="mt-2 text-2xl font-black">
          {t.prize.earnedTitle}
        </h2>
        <p className="text-xl font-extrabold">{prize.title}</p>
        <p className="text-ink-soft mt-1 font-bold">{t.prize.earnedText}</p>
      </section>
    );
  }

  return (
    <section
      data-testid="prize-banner"
      aria-labelledby="prize-title"
      className="border-sun-dark bg-sun-soft flex gap-4 rounded-3xl border-2 p-4 sm:p-5"
    >
      <span className="emoji text-5xl sm:text-6xl" aria-hidden="true">
        🎁
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 id="prize-title" className="text-ink-soft text-sm font-extrabold uppercase">
          {t.prize.title}
        </h2>
        <p className="text-xl font-black break-words">{prize.title}</p>
        {unit && (
          <p className="text-sm font-bold">
            {t.prize.goal(localized(unit.title), prize.minScore)}
          </p>
        )}
        <ProgressBar
          value={progress.done}
          max={progress.total}
          label={t.prize.progressLabel}
          tone="sun"
          className="mt-1 bg-white"
        />
        <p className="text-sm font-extrabold">{t.prize.stepsLeft(progress.stepsLeft)}</p>
      </div>
    </section>
  );
}
