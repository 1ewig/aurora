/**
 * Aurora — src/app/(admin)/admin/orders/page.tsx
 *
 * Admin orders management page.
 */

import { OrdersClient } from '@/components/admin/orders/OrdersClient';

/** Metadata for the admin orders page. */
export const metadata = {
  title: 'Orders | Admin | Aurora',
  description: 'Process and manage customer orders.',
};

/** Admin orders management page. */
export default function AdminOrdersPage() {
  return <OrdersClient />;
}
