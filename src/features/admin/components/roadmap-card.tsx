"use client";

import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Roadmap, RoadmapStatus } from "@/features/admin/types";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<RoadmapStatus, string> = {
  not_started: "bg-ink/10 text-ink",
  ahead: "bg-mint-soft text-mint-dark",
  on_track: "bg-primary-soft text-primary-dark",
  behind: "bg-coral-soft text-coral-dark",
};

/** The three-stage plan towards the entrance exam and the pace on stage one. */
export function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  const t = useT();
  const [current, ...later] = t.admin.roadmapStages;

  return (
    <Card role="region" aria-labelledby="roadmap-title" className="flex flex-col gap-3">
      <h2 id="roadmap-title" className="text-xl font-black">
        {t.admin.roadmapTitle}
      </h2>
      <ol className="flex flex-col gap-3">
        <li className="border-primary bg-primary-soft/50 flex flex-col gap-2 rounded-2xl border-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black">
              1. {current}{" "}
              <span className="text-ink-soft text-sm font-bold">
                · {t.admin.roadmapCurrent}
              </span>
            </p>
            <span
              data-testid="roadmap-status"
              className={cn(
                "rounded-full px-3 py-1 text-sm font-extrabold",
                STATUS_STYLES[roadmap.status],
              )}
            >
              {t.admin.roadmapStatus[roadmap.status]}
            </span>
          </div>
          <ProgressBar
            value={roadmap.completedLessons}
            max={roadmap.totalLessons}
            label={t.admin.roadmapProgress(
              roadmap.completedLessons,
              roadmap.totalLessons,
            )}
            className="bg-white"
          />
          <p className="text-sm font-bold">
            {t.admin.roadmapProgress(roadmap.completedLessons, roadmap.totalLessons)}
            {roadmap.status !== "not_started" &&
              ` · ${t.admin.roadmapExpected(roadmap.expectedLessons)}`}
          </p>
        </li>
        {later.map((stage, index) => (
          <li
            key={stage}
            className="border-line text-ink-soft rounded-2xl border-2 p-3 font-bold"
          >
            {index + 2}. {stage} · {t.admin.roadmapLater}
          </li>
        ))}
      </ol>
    </Card>
  );
}
