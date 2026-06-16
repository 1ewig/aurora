/**
 * Aurora — src/app/(admin)/admin/inventory/page.tsx
 *
 * Admin inventory management page.
 */

import { InventoryClient } from '@/components/admin/inventory/InventoryClient';

/** Metadata for the admin inventory page. */
export const metadata = {
  title: 'Inventory | Admin | Aurora',
  description: 'Manage the product inventory.',
};

/** Admin inventory / products management page. */
export default function AdminProductsPage() {
  return <InventoryClient />;
}

