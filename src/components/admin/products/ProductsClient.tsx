"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminStore, type ProductData } from "@/stores/useAdminStore";
import { useProductForm } from "@/hooks/useProductForm";
import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { Button } from "@/components/ui/Button";
import { ProductsTable } from "./ProductsTable";
import { ProductFormModal } from "./ProductFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function ProductsClient() {
  const products = useAdminStore((s) => s.products);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchProducts = useAdminStore((s) => s.fetchProducts);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  // Setup form hook
  const form = useProductForm(() => {
    setIsModalOpen(false);
    fetchProducts();
  });

  // Load catalog on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open modal for adding/editing product
  function handleOpenModal(product?: ProductData) {
    if (product) {
      setEditingProduct(product);
      form.resetForm(product);
    } else {
      setEditingProduct(null);
      form.resetForm(null);
    }
    setIsModalOpen(true);
  }

  // Delete product confirmation
  async function handleDeleteConfirm() {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setProductToDelete(null);
      } catch (err: any) {
        alert(err.message || "Failed to delete product");
      }
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading catalog...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : (
        <>
          <AdminHeaderPanel
            title="Inventory Management"
            description="Add, update, or remove items from the catalog."
            action={
              <Button onClick={() => handleOpenModal()} variant="gold" size="sm">
                Add Product
              </Button>
            }
          />

          {/* Products Table */}
          <ProductsTable
            filteredProducts={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEditClick={handleOpenModal}
            onDeleteClick={setProductToDelete}
          />

          {/* Form Modal */}
          <ProductFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            editingProduct={editingProduct}
            form={form}
          />

          {/* Delete Dialog */}
          <ConfirmDialog
            open={!!productToDelete}
            title="Delete Product"
            description={`Are you sure you want to permanently delete the product "${productToDelete?.name}"? All sizes, image listings, and unused storage assets will be deleted. This cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setProductToDelete(null)}
          />
        </>
      )}
    </div>
  );
}
