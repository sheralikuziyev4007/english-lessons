"use client";

import type { ReactNode } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { useAppState } from "@/features/progress/hooks/use-app-state";
import type { AppState } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";

interface StateGateProps {
  skeleton: ReactNode;
  children: (state: AppState) => ReactNode;
}

/** Loads the child's progress and handles the loading and error states. */
export function StateGate({ skeleton, children }: StateGateProps) {
  const t = useT();
  const { data, isError, error, refetch } = useAppState();

  if (data) return children(data);

  // A 401 triggers a redirect to the login page; keep the skeleton meanwhile.
  if (isError && !isApiError(error, 401)) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <div role="status" aria-label={t.common.loading}>
      {skeleton}
    </div>
  );
}
