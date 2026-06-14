import { OrdersClient } from '@/components/admin/orders/OrdersClient';

export const metadata = {
  title: 'Orders | Admin | Aurora',
  description: 'Process and manage customer orders.',
};

export default function AdminOrdersPage() {
  return <OrdersClient />;
}
