/**
 * Aurora — src/hooks/useAdminDashboard.ts
 *
 * Admin dashboard data hook: aggregates metrics, recent orders, and summary stats.
 */

"use client";

import { useAdminDashboardQuery } from "@/hooks/queries";

export function useAdminDashboard() {
  const { data, isLoading, isFetching, error } = useAdminDashboardQuery();

  return {
    metrics: data?.metrics ?? null,
    recentOrders: data?.recentOrders ?? [],
    loading: isLoading || isFetching,
    error: error?.message ?? null,
  };
}
