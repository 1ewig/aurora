import Link from "next/link";
import { type RecentOrder } from "@/stores/useAdminStore";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

interface RecentOrdersListProps {
  recentOrders: RecentOrder[];
}

export function RecentOrdersList({ recentOrders }: RecentOrdersListProps) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
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
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
