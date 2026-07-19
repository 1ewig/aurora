/**
 * Aurora — src/app/(admin)/admin/orders/page.tsx
 *
 * Admin order management page. Delegates to OrdersClient which
 * provides the order listing, status filtering, and status update
 * controls (pending → confirmed → shipped → delivered, or cancelled).
 *
 * Uses useAdminOrdersQuery for paginated listing and
 * useUpdateOrderStatusMutation for status changes.
 */

import { OrdersClient } from '@/components/admin/orders/OrdersClient';

/** Metadata for the admin orders page. */
export const metadata = {
  title: 'Orders | Admin | Aurora',
  description: 'Process and manage customer orders.',
  robots: {
    index: false,
    follow: false,
  },
};

/** Admin orders management page. */
export default function AdminOrdersPage() {
  return <OrdersClient />;
}
