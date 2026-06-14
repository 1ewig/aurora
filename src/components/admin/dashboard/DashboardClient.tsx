"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAdminStore } from "@/stores/useAdminStore";
import { MetricsGrid } from "./MetricsGrid";
import { RecentOrdersList } from "./RecentOrdersList";
import { TaskMenu } from "./TaskMenu";

export function DashboardClient() {
  const metrics = useAdminStore((s) => s.metrics);
  const recentOrders = useAdminStore((s) => s.recentOrders);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchDashboard = useAdminStore((s) => s.fetchDashboard);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Panel */}
      <div className="border-b border-border-subtle pb-6">
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-text-primary">
          Executive Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Overview of sales, order cycles, and inventory state.
        </p>
      </div>

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
