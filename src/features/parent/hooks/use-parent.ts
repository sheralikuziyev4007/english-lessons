import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  createPrize,
  fetchParentOverview,
  lockParent,
  setOfflineDone,
  unlockParent,
  updatePrize,
} from "@/features/parent/api";
import { QUERY_KEYS } from "@/lib/constants";

/** Parent changes also affect what the child sees on the home screen. */
function refreshAll(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parentOverview }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.state }),
  ]);
}

export function useParentOverview() {
  return useQuery({ queryKey: QUERY_KEYS.parentOverview, queryFn: fetchParentOverview });
}

export function useUnlockParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlockParent,
    onSuccess: () => queryClient.resetQueries({ queryKey: QUERY_KEYS.parentOverview }),
  });
}

export function useLockParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lockParent,
    onSuccess: () => queryClient.resetQueries({ queryKey: QUERY_KEYS.parentOverview }),
  });
}

export function useCreatePrize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPrize,
    onSuccess: () => refreshAll(queryClient),
  });
}

export function useUpdatePrize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePrize,
    onSuccess: () => refreshAll(queryClient),
  });
}

export function useSetOfflineDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setOfflineDone,
    onSuccess: () => refreshAll(queryClient),
  });
}
