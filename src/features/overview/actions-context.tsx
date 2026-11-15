"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PrizeAction, PrizeValues } from "@/features/overview/schemas";

/**
 * The results screen is shared by the parent section and the admin section.
 * Each of them supplies its own API calls for the things that can be changed.
 */
export interface OverviewActions {
  createPrize: (values: PrizeValues) => Promise<unknown>;
  updatePrize: (input: { id: number; action: PrizeAction }) => Promise<unknown>;
  setOfflineDone: (done: boolean) => Promise<unknown>;
  /** Refetches everything the change may have affected. */
  refresh: () => Promise<unknown>;
}

const OverviewActionsContext = createContext<OverviewActions | null>(null);

interface ProviderProps {
  actions: OverviewActions;
  children: ReactNode;
}

export function OverviewActionsProvider({ actions, children }: ProviderProps) {
  return <OverviewActionsContext value={actions}>{children}</OverviewActionsContext>;
}

export function useOverviewActions(): OverviewActions {
  const actions = useContext(OverviewActionsContext);
  if (!actions) throw new Error("OverviewActionsProvider is missing.");
  return actions;
}
