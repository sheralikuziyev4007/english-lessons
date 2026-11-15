"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { useSetOfflineDone } from "@/features/admin/hooks/use-admin";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { getOfflineTask } from "@/lib/offline-task";

const CHECKBOX_ID = "offline-done";

/** The admin confirms here that today's away-from-screen task was done. */
export function OfflineTaskCard({ state }: { state: AppState }) {
  const accountId = state.account.id;
  const t = useT();
  const setOffline = useSetOfflineDone(accountId);
  // Local copy so the checkbox responds at once; a failed save puts it back.
  const [done, setDone] = useState(state.todayStats.offlineDone);

  return (
    <Card role="region" aria-labelledby="offline-title" className="flex flex-col gap-3">
      <h2 id="offline-title" className="text-xl font-black">
        {t.admin.offlineTitle}
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
          checked={done}
          disabled={setOffline.isPending}
          onChange={(event) => {
            const next = event.target.checked;
            setDone(next);
            setOffline.mutate(next, { onError: () => setDone(!next) });
          }}
        />
        {t.admin.offlineToggle}
      </label>
      {setOffline.isError && (
        <p role="alert" className="text-coral text-sm font-bold">
          {t.errors.generic}
        </p>
      )}
    </Card>
  );
}
