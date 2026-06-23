/**
 * Aurora — src/hooks/useAdminDashboard.ts
 *
 * Custom hook to manage fetching and store values for executive dashboard stats.
 */

"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/stores/useAdminStore";

export function useAdminDashboard() {
  const metrics = useAdminStore((s) => s.metrics);
  const recentOrders = useAdminStore((s) => s.recentOrders);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchDashboard = useAdminStore((s) => s.fetchDashboard);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    metrics,
    recentOrders,
    loading,
    error,
  };
}
