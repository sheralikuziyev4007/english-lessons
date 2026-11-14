"use client";

import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";

interface StatsRowProps {
  state: Pick<AppState, "streak" | "totalStars" | "learnedWords">;
}

export function StatsRow({ state }: StatsRowProps) {
  const t = useT();
  const stats = [
    { icon: "🔥", value: state.streak, label: t.home.streakLabel, id: "streak" },
    { icon: "⭐", value: state.totalStars, label: t.home.starsLabel, id: "stars" },
    { icon: "📚", value: state.learnedWords, label: t.home.wordsLabel, id: "words" },
  ];

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="border-line bg-paper flex flex-col items-center rounded-3xl border-2 px-2 py-3 text-center"
        >
          <dt className="text-ink-soft order-2 text-xs font-extrabold sm:text-sm">
            {stat.label}
          </dt>
          <dd data-testid={`stat-${stat.id}`} className="text-2xl font-black sm:text-3xl">
            <span className="emoji mr-1" aria-hidden="true">
              {stat.icon}
            </span>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
