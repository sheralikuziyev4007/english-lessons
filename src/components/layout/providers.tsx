"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, type ReactNode } from "react";

import { isApiError } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import { useLocaleStore } from "@/store/locale-store";

const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 2;

function redirectToLogin(): void {
  if (window.location.pathname !== ROUTES.login) {
    window.location.assign(ROUTES.login);
  }
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (isApiError(error, 401)) redirectToLogin();
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        // Auth errors will not fix themselves; only retry network/server errors.
        retry: (failureCount, error) =>
          !isApiError(error, 401) &&
          !isApiError(error, 403) &&
          failureCount < MAX_RETRIES,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    void useLocaleStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
}
