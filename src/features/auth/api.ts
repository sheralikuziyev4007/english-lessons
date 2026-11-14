import type { LoginValues } from "@/features/auth/schemas";
import { api } from "@/lib/api-client";

interface OkResponse {
  ok: boolean;
}

export function login(values: LoginValues): Promise<OkResponse> {
  return api<OkResponse>("/api/auth/login", { method: "POST", body: values });
}

export function logout(): Promise<OkResponse> {
  return api<OkResponse>("/api/auth/logout", { method: "POST" });
}
