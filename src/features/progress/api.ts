import type { AppState } from "@/features/progress/types";
import { api } from "@/lib/api-client";

export function fetchState(): Promise<AppState> {
  return api<AppState>("/api/state");
}
