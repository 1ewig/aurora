/**
 * Aurora — src/app/providers.tsx
 *
 * Root client-side providers wrapper. Initializes TanStack React Query
 * with sensible defaults and wraps the app tree.
 *
 * QueryClient defaults:
 *  - staleTime: 5 minutes — data is considered fresh for 5 min before
 *    background refetch is triggered.
 *  - gcTime (formerly cacheTime): 10 minutes — unused query data stays
 *    in memory for 10 min before garbage collection.
 *  - refetchOnWindowFocus: false — avoids spurious refetches when users
 *    tab back to the page.
 *
 * The QueryClient instance is created once via useState initializer
 * (lazy init pattern) and persists for the component lifetime.
 * Auth initialization (session fetch + role check) is handled by
 * AuthInitializer in the root layout, not here.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/** Root providers component wrapping the app with React Query and auth initialization. */
export default function Providers({ children }: { children: React.ReactNode }) {
  /*
   * useState initializer runs once per mount. This avoids recreating the
   * QueryClient on every render, which would discard all cached queries.
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 min before data is considered stale and eligible for refetch.
            staleTime: 1000 * 60 * 5,
            // Unused query data persists for 10 min before garbage collection.
            gcTime: 1000 * 60 * 10,
            // Disable refetch-on-focus to avoid distracting background loads.
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
