import type { PinValues, PrizeAction, PrizeValues } from "@/features/parent/schemas";
import type { ParentOverview } from "@/features/parent/types";
import type { Prize } from "@/features/progress/types";
import { api } from "@/lib/api-client";

interface OkResponse {
  ok: boolean;
}

export function fetchParentOverview(): Promise<ParentOverview> {
  return api<ParentOverview>("/api/parent/overview");
}

export function unlockParent(values: PinValues): Promise<OkResponse> {
  return api<OkResponse>("/api/parent/unlock", { method: "POST", body: values });
}

export function lockParent(): Promise<OkResponse> {
  return api<OkResponse>("/api/parent/lock", { method: "POST" });
}

export function createPrize(values: PrizeValues): Promise<Prize> {
  return api<Prize>("/api/parent/prizes", { method: "POST", body: values });
}

export function updatePrize(input: { id: number; action: PrizeAction }): Promise<Prize> {
  return api<Prize>(`/api/parent/prizes/${input.id}`, {
    method: "PATCH",
    body: { action: input.action },
  });
}

export function setOfflineDone(done: boolean): Promise<OkResponse> {
  return api<OkResponse>("/api/parent/offline", { method: "POST", body: { done } });
}
