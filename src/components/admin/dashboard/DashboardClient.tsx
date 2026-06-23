/**
 * Aurora — src/components/admin/dashboard/DashboardClient.tsx
 *
 * Admin dashboard page composing metrics, recent orders, and task menu.
 */

"use client";

import { motion } from "framer-motion";
import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { MetricsGrid } from "./MetricsGrid";
import { RecentOrdersList } from "./RecentOrdersList";
import { TaskMenu } from "./TaskMenu";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

/** Renders the executive dashboard with metrics grid, recent orders feed, and quick tasks. */
export function DashboardClient() {
  const { metrics, recentOrders, loading, error } = useAdminDashboard();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-12">
      <AdminHeaderPanel
        title="Executive Dashboard"
        description="Overview of sales, order cycles, and inventory state."
      />

      {loading && !metrics ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading metrics...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : metrics ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Metrics Grid */}
          <MetricsGrid metrics={metrics} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Feed */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <RecentOrdersList recentOrders={recentOrders} />
            </motion.div>

            {/* Quick Tasks Menu */}
            <motion.div variants={itemVariants}>
              <TaskMenu />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
