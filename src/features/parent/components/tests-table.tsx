"use client";

import { Card } from "@/components/ui/card";
import { getUnitLessons, UNITS } from "@/features/content";
import { isLessonDone, isTestPassed } from "@/features/progress/lib/unlock";
import type { AppState } from "@/features/progress/types";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

/** Per-unit results: lessons finished and the best unit test score. */
export function TestsTable({ state }: { state: AppState }) {
  const t = useT();
  const localized = useLocalized();

  return (
    <Card role="region" aria-labelledby="tests-title" className="flex flex-col gap-3">
      <h2 id="tests-title" className="text-xl font-black">
        {t.parent.testsTitle}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 text-left">
          <thead>
            <tr className="text-ink-soft border-line border-b-2 text-sm">
              <th scope="col" className="py-2 pr-3 font-extrabold">
                {t.parent.testsUnit}
              </th>
              <th scope="col" className="py-2 pr-3 font-extrabold">
                {t.parent.testsLessons}
              </th>
              <th scope="col" className="py-2 font-extrabold">
                {t.parent.testsScore}
              </th>
            </tr>
          </thead>
          <tbody>
            {UNITS.map((unit) => {
              const lessons = getUnitLessons(unit.id);
              const done = lessons.filter((lesson) =>
                isLessonDone(lesson.id, state),
              ).length;
              const test = state.tests[unit.id];
              const passed = isTestPassed(unit.id, state);

              return (
                <tr key={unit.id} className="border-line border-b last:border-b-0">
                  <th scope="row" className="py-2 pr-3 font-extrabold">
                    <span className="emoji mr-2" aria-hidden="true">
                      {unit.icon}
                    </span>
                    {localized(unit.title)}
                  </th>
                  <td className="py-2 pr-3 font-bold">
                    {done} / {lessons.length}
                  </td>
                  <td className="py-2 font-bold">
                    {test ? (
                      <span
                        className={cn("font-black", passed ? "text-mint" : "text-coral")}
                      >
                        {test.bestScore}% ·{" "}
                        {passed ? t.parent.testsPassed : t.parent.testsFailed}
                      </span>
                    ) : (
                      <span className="text-ink-soft">{t.parent.testsNotTaken}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
