import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitSession } from "@/features/learning/api";
import { QUERY_KEYS } from "@/lib/constants";

export function useSubmitSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSession,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.state }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parentOverview }),
      ]),
  });
}
