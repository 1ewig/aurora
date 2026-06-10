"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache lifetime
            gcTime: 1000 * 60 * 10,   // 10 minutes garbage collection
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
