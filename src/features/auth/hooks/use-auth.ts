import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login, logout } from "@/features/auth/api";
import { ROUTES } from "@/lib/constants";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.clear();
      // A full navigation makes sure the new session cookie is used everywhere.
      window.location.assign(ROUTES.home);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.assign(ROUTES.login);
    },
  });
}
