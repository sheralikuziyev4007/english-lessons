"use client";

import type { ParentOverview } from "@/features/parent/types";
import { useT } from "@/hooks/use-t";

export function SummaryCards({ overview }: { overview: ParentOverview }) {
  const t = useT();
  const { state, roadmap } = overview;
  const items = [
    { id: "streak", label: t.parent.streak, value: String(state.streak) },
    { id: "stars", label: t.parent.stars, value: String(state.totalStars) },
    { id: "words", label: t.parent.learnedWords, value: String(state.learnedWords) },
    {
      id: "lessons",
      label: t.parent.lessonsDone,
      value: `${roadmap.completedLessons} / ${roadmap.totalLessons}`,
    },
  ];

  return (
    <section aria-labelledby="summary-title">
      <h2 id="summary-title" className="sr-only">
        {t.parent.summaryTitle}
      </h2>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-line bg-paper flex flex-col rounded-3xl border-2 p-4"
          >
            <dt className="text-ink-soft order-2 text-sm font-extrabold">{item.label}</dt>
            <dd data-testid={`summary-${item.id}`} className="text-3xl font-black">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
