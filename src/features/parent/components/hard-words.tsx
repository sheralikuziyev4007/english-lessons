"use client";

import { Card } from "@/components/ui/card";
import { WordVisual } from "@/components/ui/word-visual";
import { getWord } from "@/features/content";
import type { HardWord } from "@/features/parent/types";
import { useT } from "@/hooks/use-t";

/** Words the child gets wrong most often, so the parent can practise them offline. */
export function HardWords({ words }: { words: HardWord[] }) {
  const t = useT();

  return (
    <Card role="region" aria-labelledby="hard-title" className="flex flex-col gap-3">
      <h2 id="hard-title" className="text-xl font-black">
        {t.parent.hardTitle}
      </h2>
      {words.length === 0 ? (
        <p className="text-ink-soft py-4 text-center font-bold">{t.parent.hardEmpty}</p>
      ) : (
        <ul className="divide-line divide-y-2">
          {words.map((item) => {
            const word = getWord(item.wordId);
            if (!word) return null;
            return (
              <li key={item.wordId} className="flex items-center gap-3 py-2">
                <WordVisual visual={word.visual} label="" size="sm" />
                <p className="min-w-0 flex-1 font-bold">
                  <span lang="en" className="font-black">
                    {word.en}
                  </span>
                  <span lang="uz"> — {word.uz}</span>
                </p>
                <span className="bg-coral-soft text-coral-dark shrink-0 rounded-full px-3 py-1 text-sm font-extrabold">
                  {t.parent.hardMistakes(item.wrong)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
