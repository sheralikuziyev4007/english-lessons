import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { OverviewActions } from "@/features/overview/actions-context";
import {
  createParentPin,
  createPrize,
  fetchParentOverview,
  lockParent,
  setOfflineDone,
  unlockParent,
  updatePrize,
} from "@/features/parent/api";
import { QUERY_KEYS } from "@/lib/constants";

export function useParentOverview() {
  return useQuery({ queryKey: QUERY_KEYS.parentOverview, queryFn: fetchParentOverview });
}

/** Entering, creating or locking the PIN all change what the overview query returns. */
function useGateMutation<Input>(mutationFn: (input: Input) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.resetQueries({ queryKey: QUERY_KEYS.parentOverview }),
  });
}

export function useCreateParentPin() {
  return useGateMutation(createParentPin);
}

export function useUnlockParent() {
  return useGateMutation(unlockParent);
}

export function useLockParent() {
  return useGateMutation(lockParent);
}

/** API calls the shared results screen uses inside the parent section. */
export function useParentOverviewActions(): OverviewActions {
  const queryClient = useQueryClient();
  return {
    createPrize,
    updatePrize,
    setOfflineDone,
    // Parent changes also affect what the child sees on the home screen.
    refresh: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parentOverview }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.state }),
      ]),
  };
}
