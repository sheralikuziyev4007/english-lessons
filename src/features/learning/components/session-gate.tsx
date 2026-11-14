"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

import { SessionSkeleton } from "@/features/learning/components/session-skeleton";
import { StateGate } from "@/features/progress/components/state-gate";
import type { AppState } from "@/features/progress/types";

/**
 * Loads progress for a session screen. Next.js keeps visited pages alive in the
 * background, so the content is keyed by `bfcacheId`: opening a lesson again
 * starts a fresh session instead of showing the previous result.
 */
export function SessionGate({ children }: { children: (state: AppState) => ReactNode }) {
  const { bfcacheId } = useRouter();

  return (
    <StateGate skeleton={<SessionSkeleton />}>
      {(state) => <Fragment key={bfcacheId}>{children(state)}</Fragment>}
    </StateGate>
  );
}
