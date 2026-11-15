import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  adminLogin,
  adminLogout,
  createPrize,
  fetchAccountOverview,
  fetchAccounts,
  setOfflineDone,
  updateAccount,
  updatePrize,
} from "@/features/admin/api";
import type { PrizeValues } from "@/features/admin/schemas";
import type { AccountUpdate } from "@/features/admin/types";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * Admin changes affect the account list, the open account and, when the admin
 * is also logged in as that learner, the learner's own screens.
 */
function refreshAll(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminAccounts }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.state }),
  ]);
}

export function useAccounts() {
  return useQuery({ queryKey: QUERY_KEYS.adminAccounts, queryFn: fetchAccounts });
}

export function useAccountOverview(accountId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAccount(accountId),
    queryFn: () => fetchAccountOverview(accountId),
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminLogin,
    onSuccess: () => queryClient.resetQueries({ queryKey: QUERY_KEYS.adminAccounts }),
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminLogout,
    onSuccess: () => queryClient.resetQueries({ queryKey: QUERY_KEYS.adminAccounts }),
  });
}

export function useUpdateAccount(accountId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: AccountUpdate) => updateAccount(accountId, update),
    onSuccess: () => refreshAll(queryClient),
  });
}

export function useCreatePrize(accountId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PrizeValues) => createPrize(accountId, values),
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

export function useSetOfflineDone(accountId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (done: boolean) => setOfflineDone(accountId, done),
    onSuccess: () => refreshAll(queryClient),
  });
}
