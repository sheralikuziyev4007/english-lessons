import type {
  AdminLoginValues,
  PrizeAction,
  PrizeValues,
} from "@/features/admin/schemas";
import type {
  AccountDetails,
  AccountOverview,
  AccountsList,
  AccountUpdate,
} from "@/features/admin/types";
import type { Prize } from "@/features/progress/types";
import { api } from "@/lib/api-client";

interface OkResponse {
  ok: boolean;
}

export function adminLogin(values: AdminLoginValues): Promise<OkResponse> {
  return api<OkResponse>("/api/admin/login", { method: "POST", body: values });
}

export function adminLogout(): Promise<OkResponse> {
  return api<OkResponse>("/api/admin/logout", { method: "POST" });
}

export function fetchAccounts(): Promise<AccountsList> {
  return api<AccountsList>("/api/admin/accounts");
}

export function fetchAccountOverview(accountId: number): Promise<AccountOverview> {
  return api<AccountOverview>(`/api/admin/accounts/${accountId}`);
}

export function updateAccount(
  accountId: number,
  update: AccountUpdate,
): Promise<AccountDetails> {
  return api<AccountDetails>(`/api/admin/accounts/${accountId}`, {
    method: "PATCH",
    body: update,
  });
}

export function createPrize(accountId: number, values: PrizeValues): Promise<Prize> {
  return api<Prize>(`/api/admin/accounts/${accountId}/prizes`, {
    method: "POST",
    body: values,
  });
}

export function updatePrize(input: { id: number; action: PrizeAction }): Promise<Prize> {
  return api<Prize>(`/api/admin/prizes/${input.id}`, {
    method: "PATCH",
    body: { action: input.action },
  });
}

export function setOfflineDone(accountId: number, done: boolean): Promise<OkResponse> {
  return api<OkResponse>(`/api/admin/accounts/${accountId}/offline`, {
    method: "POST",
    body: { done },
  });
}
