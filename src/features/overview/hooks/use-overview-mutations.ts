import { useMutation } from "@tanstack/react-query";

import { useOverviewActions } from "@/features/overview/actions-context";

export function useCreatePrize() {
  const actions = useOverviewActions();
  return useMutation({ mutationFn: actions.createPrize, onSuccess: actions.refresh });
}

export function useUpdatePrize() {
  const actions = useOverviewActions();
  return useMutation({ mutationFn: actions.updatePrize, onSuccess: actions.refresh });
}

export function useSetOfflineDone() {
  const actions = useOverviewActions();
  return useMutation({ mutationFn: actions.setOfflineDone, onSuccess: actions.refresh });
}
