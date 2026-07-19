/**
 * Aurora — src/app/(admin)/admin/orders/loading.tsx
 *
 * Loading state for the admin orders page. Renders OrdersSkeleton
 * while the order list is being fetched by the client component.
 */

import { OrdersSkeleton } from "@/components/admin/orders/OrdersSkeleton";

export default function AdminOrdersLoading() {
  return <OrdersSkeleton />;
}
