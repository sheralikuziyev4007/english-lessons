import type { SessionInput, SessionResult } from "@/features/progress/types";
import { api } from "@/lib/api-client";

export function submitSession(input: SessionInput): Promise<SessionResult> {
  return api<SessionResult>("/api/sessions", { method: "POST", body: input });
}
