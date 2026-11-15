"use client";

import { Card } from "@/components/ui/card";
import type { ActivityDay } from "@/features/overview/types";
import { useT } from "@/hooks/use-t";

const MAX_BAR_PX = 96;
const MIN_BAR_PX = 4;

/** "2026-11-14" -> "14.11" */
function formatDay(day: string): string {
  return `${day.slice(8, 10)}.${day.slice(5, 7)}`;
}

export function ActivityChart({ activity }: { activity: ActivityDay[] }) {
  const t = useT();
  const peak = Math.max(...activity.map((day) => day.minutes), 1);
  const isEmpty = activity.every((day) => day.sessions === 0);

  return (
    <Card role="region" aria-labelledby="activity-title" className="flex flex-col gap-3">
      <div>
        <h2 id="activity-title" className="text-xl font-black">
          {t.overview.activityTitle}
        </h2>
        <p className="text-ink-soft text-sm font-bold">{t.overview.activityCaption}</p>
      </div>
      {isEmpty ? (
        <p className="text-ink-soft py-6 text-center font-bold">
          {t.overview.activityEmpty}
        </p>
      ) : (
        <ol className="grid grid-cols-7 items-end gap-1 sm:gap-3">
          {activity.map((day) => (
            <li key={day.day} className="flex flex-col items-center gap-1">
              <span className="text-xs font-black sm:text-sm">
                {t.overview.minutes(day.minutes)}
              </span>
              <span
                aria-hidden="true"
                className={
                  day.sessions > 0
                    ? "bg-primary w-full rounded-lg"
                    : "bg-ink/10 w-full rounded-lg"
                }
                style={{
                  height: Math.max(
                    MIN_BAR_PX,
                    Math.round((day.minutes / peak) * MAX_BAR_PX),
                  ),
                }}
              />
              <time dateTime={day.day} className="text-ink-soft text-xs font-bold">
                {formatDay(day.day)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
