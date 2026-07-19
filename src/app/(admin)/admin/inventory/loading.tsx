/**
 * Aurora — src/app/(admin)/admin/inventory/loading.tsx
 *
 * Loading state for the admin inventory page. Renders InventorySkeleton
 * while the product list is being fetched by the client component.
 */

import { InventorySkeleton } from "@/components/admin/inventory/InventorySkeleton";

export default function AdminInventoryLoading() {
  return <InventorySkeleton />;
}
