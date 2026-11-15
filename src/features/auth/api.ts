import type { LoginValues } from "@/features/auth/schemas";
import { api } from "@/lib/api-client";

interface LoginResponse {
  id: number;
  name: string;
}

/** Name-only sign-in: opens the account with this name or creates it. */
export function login(values: LoginValues): Promise<LoginResponse> {
  return api<LoginResponse>("/api/auth/login", { method: "POST", body: values });
}

export function logout(): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}
