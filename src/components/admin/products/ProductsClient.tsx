"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { insforge } from "@/utils/insforge/client";

interface SizeStock {
  size: string;
  stock: number;
}

interface ProductData {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge: string | null;
  image: string;
  altText: string;
  span: string | null;
  aspectRatio: string | null;
  description: string;
  images: string[];
  sizes: SizeStock[];
  details: string[];
}

export function ProductsClient() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  // Form State
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("tops");
  const [formPrice, setFormPrice] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formAltText, setFormAltText] = useState("");
  const [formSpan, setFormSpan] = useState("");
  const [formAspectRatio, setFormAspectRatio] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDetailInput, setFormDetailInput] = useState("");
  const [formDetails, setFormDetails] = useState<string[]>([]);
  const [formSizes, setFormSizes] = useState<SizeStock[]>([
    { size: "S", stock: 10 },
    { size: "M", stock: 10 },
    { size: "L", stock: 10 },
  ]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeStock, setNewSizeStock] = useState("10");

  // Image upload states
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Delete Dialog State
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);

  // Load products
  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for add or edit
  function handleOpenModal(product?: ProductData) {
    if (product) {
      // Edit mode
      setEditingProduct(product);
      setFormId(product.id);
      setFormName(product.name);
      setFormSlug(product.slug);
      setFormCategory(product.category);
      setFormPrice(String(product.price));
      setFormBadge(product.badge || "");
      setFormAltText(product.altText || "");
      setFormSpan(product.span || "");
      setFormAspectRatio(product.aspectRatio || "");
      setFormDescription(product.description || "");
      setFormDetails(product.details || []);
      setFormSizes(product.sizes || []);
      setMainImageUrl(product.image);
      setGalleryUrls(product.images || []);
    } else {
      // Add mode
      setEditingProduct(null);
      setFormId("");
      setFormName("");
      setFormSlug("");
      setFormCategory("tops");
      setFormPrice("");
      setFormBadge("");
      setFormAltText("");
      setFormSpan("");
      setFormAspectRatio("");
      setFormDescription("");
      setFormDetails([]);
      setFormSizes([
        { size: "S", stock: 10 },
        { size: "M", stock: 10 },
        { size: "L", stock: 10 },
      ]);
      setMainImageUrl("");
      setGalleryUrls([]);
    }
    setIsModalOpen(true);
  }

  // Handle auto-slug from name
  useEffect(() => {
    if (!editingProduct && formName) {
      const slugified = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(slugified);
    }
  }, [formName, editingProduct]);

  // Upload image to InsForge bucket
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isGallery = false) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.substring(file.name.lastIndexOf("."));
        const idForPath = formId.trim() || "temp";
        const key = `${idForPath}/${Date.now()}-${Math.floor(Math.random() * 1000)}${fileExt}`;
        
        const { data, error } = await insforge.storage.from("product-media").upload(key, file);
        if (error) throw error;
        return data?.url || "";
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);

      if (isGallery) {
        setGalleryUrls((prev) => [...prev, ...validUrls]);
      } else {
        setMainImageUrl(validUrls[0] || "");
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  // Save changes
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formId.trim()) {
      alert("Product ID is required");
      return;
    }
    if (!mainImageUrl) {
      alert("Main image is required");
      return;
    }

    const payload = {
      id: formId.trim(),
      slug: formSlug.trim(),
      name: formName.trim(),
      category: formCategory,
      price: parseFloat(formPrice),
      badge: formBadge.trim() || null,
      image: mainImageUrl,
      altText: formAltText.trim() || formName.trim(),
      span: formSpan.trim() || null,
      aspectRatio: formAspectRatio.trim() || null,
      description: formDescription.trim(),
      images: galleryUrls,
      sizes: formSizes,
      details: formDetails,
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Delete product
  async function handleDeleteConfirm() {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");
      
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Add detail bullet
  function handleAddDetail() {
    if (formDetailInput.trim()) {
      setFormDetails((prev) => [...prev, formDetailInput.trim()]);
      setFormDetailInput("");
    }
  }

  // Remove detail bullet
  function handleRemoveDetail(index: number) {
    setFormDetails((prev) => prev.filter((_, i) => i !== index));
  }

  // Add size / stock
  function handleAddSize() {
    if (newSizeName.trim()) {
      const stock = parseInt(newSizeStock, 10);
      if (isNaN(stock) || stock < 0) {
        alert("Invalid stock level");
        return;
      }
      setFormSizes((prev) => {
        // Prevent duplicate sizes in list
        const filtered = prev.filter((s) => s.size.toUpperCase() !== newSizeName.trim().toUpperCase());
        return [...filtered, { size: newSizeName.trim().toUpperCase(), stock }];
      });
      setNewSizeName("");
    }
  }

  // Remove size
  function handleRemoveSize(size: string) {
    setFormSizes((prev) => prev.filter((s) => s.size !== size));
  }

  // Edit stock directly in list
  function handleStockChange(size: string, stockStr: string) {
    const stock = parseInt(stockStr, 10);
    if (isNaN(stock)) return;
    setFormSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, stock: Math.max(0, stock) } : s))
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-text-primary">
            Inventory Management
          </h1>
          <p className="text-text-secondary text-sm">
            Add, update, or remove items from the catalog.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="gold" size="sm">
          Add Product
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search product ID, name, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md px-5 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading catalog...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-20 text-center text-text-secondary text-sm border border-border-subtle rounded-2xl bg-white">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-subtle rounded-[24px] bg-bg-secondary shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-primary/50 uppercase tracking-wider text-[10px] font-semibold text-text-secondary">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock levels</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredProducts.map((p) => {
                const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
                const isLowStock = p.sizes.some((s) => s.stock < 5);

                return (
                  <tr key={p.id} className="hover:bg-bg-primary/25 transition-colors">
                    <td className="px-6 py-4">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.altText}
                          className="w-12 h-16 object-cover rounded-[8px] border border-border-subtle"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-bg-primary rounded-[8px] flex items-center justify-center text-[10px] text-text-muted">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-text-primary">
                      {p.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">{p.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{p.slug}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-text-secondary">
                      {p.category}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {p.sizes.map((s) => (
                          <span
                            key={s.size}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              s.stock < 5
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-bg-primary text-text-secondary border-border-subtle"
                            }`}
                          >
                            {s.size}: {s.stock}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1.5">
                        <span>Total Stock: {totalStock}</span>
                        {isLowStock && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" title="Low stock alert" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-error hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-bg-secondary border border-border-subtle rounded-[24px] shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[85vh]"
            >
              <h2 className="font-display font-black text-2xl uppercase tracking-wider mb-6">
                {editingProduct ? `Edit Product — ID: ${editingProduct.id}` : "Add Product"}
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Product ID (e.g. p15)
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingProduct}
                        value={formId}
                        onChange={(e) => setFormId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm disabled:opacity-50 focus:border-accent-primary focus:outline-none"
                        placeholder="p15"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                        placeholder="Classic Wool Coat"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Slug (unique identifier)
                      </label>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                        placeholder="classic-wool-coat"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Category
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                        >
                          <option value="tops">Tops</option>
                          <option value="bottoms">Bottoms</option>
                          <option value="outerwear">Outerwear</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                          placeholder="350.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Badge (optional)
                        </label>
                        <input
                          type="text"
                          value={formBadge}
                          onChange={(e) => setFormBadge(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                          placeholder="New / Limited"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Span grid size (optional)
                        </label>
                        <input
                          type="text"
                          value={formSpan}
                          onChange={(e) => setFormSpan(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                          placeholder="col-span-2 / tall"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Aspect Ratio (optional)
                        </label>
                        <input
                          type="text"
                          value={formAspectRatio}
                          onChange={(e) => setFormAspectRatio(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                          placeholder="3/4 or portrait"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          required
                          value={formAltText}
                          onChange={(e) => setFormAltText(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                          placeholder="Wool coat on model"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media uploads and descriptions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Description
                      </label>
                      <textarea
                        required
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded-2xl text-sm focus:border-accent-primary focus:outline-none"
                        placeholder="Product detailed description..."
                      />
                    </div>

                    {/* Image uploads */}
                    <div className="border border-border-subtle p-4 rounded-2xl bg-bg-primary/20 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                          Main Image ({uploading ? "Uploading..." : "Click to select"})
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, false)}
                            className="text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border file:border-border-medium file:text-xs file:font-semibold file:bg-white hover:file:bg-bg-primary file:cursor-pointer"
                          />
                          {mainImageUrl && (
                            <img
                              src={mainImageUrl}
                              alt="Upload preview"
                              className="w-10 h-14 object-cover rounded border border-border-subtle"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                          Gallery Images
                        </label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(e, true)}
                            className="text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border file:border-border-medium file:text-xs file:font-semibold file:bg-white hover:file:bg-bg-primary file:cursor-pointer"
                          />
                          <div className="flex gap-2 overflow-x-auto py-1">
                            {galleryUrls.map((url, index) => (
                              <div key={index} className="relative group flex-shrink-0">
                                <img
                                  src={url}
                                  alt="Gallery item"
                                  className="w-10 h-14 object-cover rounded border border-border-subtle"
                                />
                                <button
                                  type="button"
                                  onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== index))}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center hover:bg-red-700 cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sizes and stock list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                      Sizes & Stock levels
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Size (e.g. XL, 38)"
                        value={newSizeName}
                        onChange={(e) => setNewSizeName(e.target.value)}
                        className="w-1/2 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={newSizeStock}
                        onChange={(e) => setNewSizeStock(e.target.value)}
                        className="w-1/4 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-4 py-2 bg-bg-ink text-text-inverted rounded-full text-xs hover:bg-text-primary transition-colors cursor-pointer"
                      >
                        Add Size
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formSizes.length === 0 ? (
                        <div className="text-xs text-text-muted italic">No sizes specified.</div>
                      ) : (
                        formSizes.map((s) => (
                          <div key={s.size} className="flex items-center justify-between bg-bg-primary/40 p-2 px-3 border border-border-subtle rounded-lg">
                            <span className="font-mono text-sm font-semibold">{s.size}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-text-secondary">Stock:</span>
                              <input
                                type="number"
                                value={s.stock}
                                onChange={(e) => handleStockChange(s.size, e.target.value)}
                                className="w-16 px-2 py-1 bg-white border border-border-medium rounded text-xs text-center focus:outline-none focus:border-accent-primary"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(s.size)}
                                className="text-error font-bold text-xs hover:text-red-700 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bullet details */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                      Detail bullet points
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="e.g. 100% cashmere, Made in Italy"
                        value={formDetailInput}
                        onChange={(e) => setFormDetailInput(e.target.value)}
                        className="flex-1 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddDetail}
                        className="px-4 py-2 bg-bg-ink text-text-inverted rounded-full text-xs hover:bg-text-primary transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <ul className="space-y-1.5">
                      {formDetails.length === 0 ? (
                        <li className="text-xs text-text-muted italic">No detail bullet points added.</li>
                      ) : (
                        formDetails.map((detail, index) => (
                          <li key={index} className="flex items-start justify-between text-xs bg-bg-primary/20 p-2.5 rounded-lg border border-border-subtle">
                            <span className="flex-1 pr-4 text-text-secondary">{detail}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(index)}
                              className="text-error hover:text-red-700 cursor-pointer text-xs"
                            >
                              Remove
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
                  <Button type="button" onClick={() => setIsModalOpen(false)} variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading} variant="gold" size="sm">
                    {uploading ? "Uploading..." : "Save Product"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!productToDelete}
        title="Delete Product"
        description={`Are you sure you want to permanently delete the product "${productToDelete?.name}"? All sizes, image listings, and unused storage assets will be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
