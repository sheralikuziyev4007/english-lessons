"use client";

import { Card } from "@/components/ui/card";
import { useSetOfflineDone } from "@/features/parent/hooks/use-parent";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { getOfflineTask } from "@/lib/offline-task";

const CHECKBOX_ID = "offline-done";

/** The parent confirms here that today's away-from-screen task was done. */
export function OfflineTaskCard({ state }: { state: AppState }) {
  const t = useT();
  const setOffline = useSetOfflineDone();

  return (
    <Card role="region" aria-labelledby="offline-title" className="flex flex-col gap-3">
      <h2 id="offline-title" className="text-xl font-black">
        {t.parent.offlineTitle}
      </h2>
      <p className="font-bold">{getOfflineTask(t.offlineTasks, state.today)}</p>
      <label
        htmlFor={CHECKBOX_ID}
        className="border-line flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 font-extrabold"
      >
        <input
          id={CHECKBOX_ID}
          type="checkbox"
          className="accent-mint size-6"
          checked={state.todayStats.offlineDone}
          disabled={setOffline.isPending}
          onChange={(event) => setOffline.mutate(event.target.checked)}
        />
        {t.parent.offlineToggle}
      </label>
      {setOffline.isError && (
        <p role="alert" className="text-coral text-sm font-bold">
          {t.errors.generic}
        </p>
      )}
    </Card>
  );
}
