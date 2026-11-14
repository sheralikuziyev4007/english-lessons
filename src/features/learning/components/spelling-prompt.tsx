"use client";

import { WordVisual } from "@/components/ui/word-visual";
import type { Word } from "@/features/content";
import { ListenButton } from "@/features/learning/components/listen-button";
import { useT } from "@/hooks/use-t";

/** Shows which word has to be spelled: its picture, meaning and sound. */
export function SpellingPrompt({ word }: { word: Word }) {
  const t = useT();

  return (
    <div className="flex items-center gap-4">
      <WordVisual visual={word.visual} label="" size="md" />
      <p lang="uz" className="text-2xl font-black">
        {word.uz}
      </p>
      <ListenButton text={word.en} label={t.session.listen} />
    </div>
  );
}
