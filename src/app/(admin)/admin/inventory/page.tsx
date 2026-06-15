import { ProductsClient } from '@/components/admin/products/ProductsClient';

export const metadata = {
  title: 'Inventory | Admin | Aurora',
  description: 'Manage the product inventory.',
};

export default function AdminProductsPage() {
  return <ProductsClient />;
}
