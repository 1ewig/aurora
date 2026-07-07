"use client";

import { useState, useMemo } from "react";
import type { ProductData } from "@/stores/useAdminStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAdminProductsQuery, useDeleteProductMutation } from "@/hooks/queries";
import { useProductForm } from "@/hooks/useProductForm";
import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { Button } from "@/components/ui/Button";
import { InventoryTable } from "./InventoryTable";
import { InventorySkeleton } from "./InventorySkeleton";
import { ProductFormModal } from "./ProductFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function InventoryClient() {
  const { data: products = [], isLoading, error, refetch } = useAdminProductsQuery();
  const deleteMutation = useDeleteProductMutation();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) => {
          const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory =
            selectedCategory === "All" ||
            p.category.toLowerCase() === selectedCategory.toLowerCase();
          return matchesSearch && matchesCategory;
        }
      ),
    [products, searchQuery, selectedCategory]
  );


  const form = useProductForm(() => {
    setIsModalOpen(false);
  });

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

  async function handleDeleteConfirm() {
    if (productToDelete) {
      setDeleting(true);
      try {
        await deleteMutation.mutateAsync(productToDelete.id);
        setProductToDelete(null);
        setIsModalOpen(false);
      } catch (err: any) {
        alert(err.message || "Failed to delete product");
      } finally {
        setDeleting(false);
      }
    }
  }

  const displayError = error ? (typeof error === 'object' && 'message' in error ? (error as Error).message : 'An error occurred') : null;

  return (
    <div className="space-y-8 pb-12">
      {isLoading && products.length === 0 ? (
        <InventorySkeleton />
      ) : displayError ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {displayError}
        </div>
      ) : (
        <>
          <AdminHeaderPanel
            title="Inventory Management"
            description="Add, update, or remove items from the catalog."
            action={isAdmin ? (
              <Button onClick={() => handleOpenModal()} variant="gold" size="sm">
                Add Product
              </Button>
            ) : undefined}
          />

          <InventoryTable
            filteredProducts={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onEditClick={handleOpenModal}
            isAdmin={isAdmin}
            onRefresh={refetch}
            loading={isLoading}
          />

          <ProductFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            editingProduct={editingProduct}
            form={form}
            onDelete={() => setProductToDelete(editingProduct)}
            deleting={deleting}
          />

          <ConfirmDialog
            open={!!productToDelete}
            title="Delete Product"
            description={`Are you sure you want to permanently delete the product "${productToDelete?.name}"? All sizes, image listings, and unused storage assets will be deleted. This cannot be undone.`}
            confirmLabel={deleting ? "Deleting..." : "Delete"}
            cancelLabel="Cancel"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setProductToDelete(null)}
            disabled={deleting}
          />
        </>
      )}
    </div>
  );
}
