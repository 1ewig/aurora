"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingCount: number;
  shippedCount: number;
  lowStockCount: number;
}

interface RecentOrder {
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  firstName: string;
  lastName: string;
}

export function DashboardClient() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load metrics");
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentOrders(data.recentOrders);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helpers for icon renders
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

  // Animation helper
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

      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading metrics...
        </div>
      ) : error || !metrics ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error || "Failed to load dashboard data."}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Metrics Grid */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Feed */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-text-primary">
                  Recent Orders
                </h3>
                <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider text-accent-primary hover:underline">
                  View All
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-xs text-text-secondary italic py-6">No purchases logged.</div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {recentOrders.map((order) => (
                    <div key={order.orderNumber} className="py-3.5 flex items-center justify-between text-sm hover:bg-bg-primary/10 transition-colors rounded-lg px-2">
                      <div className="min-w-0 pr-4">
                        <div className="font-bold text-text-primary font-mono">{order.orderNumber}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {order.firstName} {order.lastName} · {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="font-bold text-text-primary">${order.total.toFixed(2)}</div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase mt-1 border ${
                            order.status === "confirmed" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            order.status === "shipped" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Links Menu */}
            <motion.div variants={itemVariants} className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-text-primary border-b border-border-subtle pb-4">
                Operational Tasks
              </h3>
              
              <div className="flex flex-col gap-3">
                <Link
                  href="/admin/products"
                  className="p-4 bg-bg-primary/40 rounded-xl border border-border-subtle hover:border-accent-primary transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">Catalog Editor</div>
                    <div className="text-xs text-text-secondary mt-1">Add or adjust sizes & stock</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-text-secondary group-hover:text-accent-primary group-hover:translate-x-1 transition-all">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>

                <Link
                  href="/admin/orders"
                  className="p-4 bg-bg-primary/40 rounded-xl border border-border-subtle hover:border-accent-primary transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">Order Fulfillment</div>
                    <div className="text-xs text-text-secondary mt-1">Fulfill pending orders</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-text-secondary group-hover:text-accent-primary group-hover:translate-x-1 transition-all">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>

                <Link
                  href="/"
                  className="p-4 bg-bg-primary/40 rounded-xl border border-border-subtle hover:border-accent-primary transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">View Customer Site</div>
                    <div className="text-xs text-text-secondary mt-1">Navigate back to user catalog</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-text-secondary group-hover:text-accent-primary group-hover:translate-x-1 transition-all">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
