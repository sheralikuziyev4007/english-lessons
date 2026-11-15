"use client";

import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { STAGES } from "@/features/content";
import type { Roadmap, RoadmapStatus } from "@/features/overview/types";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<RoadmapStatus, string> = {
  not_started: "bg-ink/10 text-ink",
  ahead: "bg-mint-soft text-mint-dark",
  on_track: "bg-primary-soft text-primary-dark",
  behind: "bg-coral-soft text-coral-dark",
};

/** The plan towards the entrance exam: progress per stage and the overall pace. */
export function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  const t = useT();
  // The stage being studied now is the first one that is not finished yet.
  const currentId = roadmap.stages.find(
    (stage) => stage.completedLessons < stage.totalLessons,
  )?.id;

  return (
    <Card role="region" aria-labelledby="roadmap-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="roadmap-title" className="text-xl font-black">
          {t.overview.roadmapTitle}
        </h2>
        <span
          data-testid="roadmap-status"
          className={cn(
            "rounded-full px-3 py-1 text-sm font-extrabold",
            STATUS_STYLES[roadmap.status],
          )}
        >
          {t.overview.roadmapStatus[roadmap.status]}
        </span>
      </div>
      {roadmap.status !== "not_started" && (
        <p className="text-sm font-bold">
          {t.overview.roadmapExpected(roadmap.expectedLessons)}
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {roadmap.stages.map((progress, index) => {
          const stage = STAGES.find((item) => item.id === progress.id);
          const isCurrent = progress.id === currentId;
          const label = t.overview.roadmapProgress(
            progress.completedLessons,
            progress.totalLessons,
          );

          return (
            <li
              key={progress.id}
              data-testid="roadmap-stage"
              data-stage={progress.id}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border-2 p-3",
                isCurrent ? "border-primary bg-primary-soft/50" : "border-line",
              )}
            >
              <p className="font-black">
                {index + 1}. {stage?.name} · {stage?.level}
                {isCurrent && (
                  <span className="text-ink-soft text-sm font-bold">
                    {" "}
                    · {t.overview.roadmapCurrent}
                  </span>
                )}
              </p>
              <ProgressBar
                value={progress.completedLessons}
                max={progress.totalLessons}
                label={label}
                className="bg-white"
              />
              <p className="text-sm font-bold">{label}</p>
            </li>
          );
        })}
        <li className="border-line text-ink-soft rounded-2xl border-2 p-3 font-bold">
          {roadmap.stages.length + 1}. {t.overview.roadmapNext} ·{" "}
          {t.overview.roadmapLater}
        </li>
      </ol>
    </Card>
  );
}
