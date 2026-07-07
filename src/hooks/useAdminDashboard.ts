"use client";

import { useAdminDashboardQuery } from "@/hooks/queries";

export function useAdminDashboard() {
  const { data, isLoading, error } = useAdminDashboardQuery();

  return {
    metrics: data?.metrics ?? null,
    recentOrders: data?.recentOrders ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}
