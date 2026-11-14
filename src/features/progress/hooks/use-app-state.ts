import { useQuery } from "@tanstack/react-query";

import { fetchState } from "@/features/progress/api";
import { QUERY_KEYS } from "@/lib/constants";

/** The child's progress. Shared by every learner-facing screen. */
export function useAppState() {
  return useQuery({ queryKey: QUERY_KEYS.state, queryFn: fetchState });
}
