/**
 * Aurora — src/components/admin/dashboard/MetricsGrid.tsx
 *
 * Dashboard metrics cards displaying sales, orders, pending, and low-stock counts.
 */
"use client";

import { motion } from "framer-motion";
import { type DashboardMetrics } from "@/stores/useAdminStore";

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

function SalesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};


/** Renders a grid of dashboard metric cards (total sales, orders, pending, low-stock). */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div variants={itemVariants} className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-bg-primary rounded-xl"><SalesIcon /></div>
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Sales</div>
          <div className="text-2xl font-black text-text-primary mt-1">${metrics.totalSales.toFixed(2)}</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-bg-primary rounded-xl"><OrdersIcon /></div>
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Completed Orders</div>
          <div className="text-2xl font-black text-text-primary mt-1">{metrics.totalOrders}</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-bg-primary rounded-xl"><PendingIcon /></div>
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pending Orders</div>
          <div className="text-2xl font-black text-text-primary mt-1">{metrics.pendingCount}</div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className={`border rounded-2xl p-6 shadow-sm flex items-center gap-4 ${
          metrics.lowStockCount > 0 ? "bg-red-50/20 border-red-200" : "bg-bg-secondary border-border-subtle"
        }`}
      >
        <div className="p-3 bg-white rounded-xl"><AlertIcon /></div>
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Low Stock Items</div>
          <div className={`text-2xl font-black mt-1 ${metrics.lowStockCount > 0 ? "text-red-600" : "text-text-primary"}`}>
            {metrics.lowStockCount}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
