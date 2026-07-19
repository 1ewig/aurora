/**
 * Aurora — src/app/(admin)/admin/inventory/page.tsx
 *
 * Admin inventory / product management page. Delegates to InventoryClient
 * which provides the product CRUD interface: list, create, edit, delete
 * products with image upload, size/stock management, and detail bullets.
 *
 * Uses useAdminProductsQuery for the product list and useSaveProductMutation
 * / useDeleteProductMutation for mutations. Image uploads go to the
 * InsForge 'product-media' storage bucket.
 */

import { InventoryClient } from '@/components/admin/inventory/InventoryClient';

/** Metadata for the admin inventory page. */
export const metadata = {
  title: 'Inventory | Admin | Aurora',
  description: 'Manage the product inventory.',
  robots: {
    index: false,
    follow: false,
  },
};

/** Admin inventory / products management page. */
export default function AdminProductsPage() {
  return <InventoryClient />;
}

