import { InventoryClient } from '@/components/admin/inventory/InventoryClient';

export const metadata = {
  title: 'Inventory | Admin | Aurora',
  description: 'Manage the product inventory.',
};

export default function AdminProductsPage() {
  return <InventoryClient />;
}

