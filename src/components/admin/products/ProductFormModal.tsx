"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { type ProductData } from "@/stores/useAdminStore";
import { useProductForm } from "@/hooks/useProductForm";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductData | null;
  form: ReturnType<typeof useProductForm>;
}

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  form,
}: ProductFormModalProps) {
  // Add detail bullet
  function handleAddDetailClick() {
    form.handleAddDetail();
  }

  // Add size / stock
  function handleAddSizeClick() {
    form.handleAddSize();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSave(editingProduct);
              }}
              className="space-y-6"
            >
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
                      value={form.formId}
                      onChange={(e) => form.setFormId(e.target.value)}
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
                      value={form.formName}
                      onChange={(e) => form.setFormName(e.target.value)}
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
                      value={form.formSlug}
                      onChange={(e) => form.setFormSlug(e.target.value)}
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
                        value={form.formCategory}
                        onChange={(e) => form.setFormCategory(e.target.value)}
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
                        value={form.formPrice}
                        onChange={(e) => form.setFormPrice(e.target.value)}
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
                        value={form.formBadge}
                        onChange={(e) => form.setFormBadge(e.target.value)}
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
                        value={form.formSpan}
                        onChange={(e) => form.setFormSpan(e.target.value)}
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
                        value={form.formAspectRatio}
                        onChange={(e) => form.setFormAspectRatio(e.target.value)}
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
                        value={form.formAltText}
                        onChange={(e) => form.setFormAltText(e.target.value)}
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
                      value={form.formDescription}
                      onChange={(e) => form.setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded-2xl text-sm focus:border-accent-primary focus:outline-none"
                      placeholder="Product detailed description..."
                    />
                  </div>

                  {/* Image uploads */}
                  <div className="border border-border-subtle p-4 rounded-2xl bg-bg-primary/20 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                        Main Image ({form.uploading ? "Uploading..." : "Click to select"})
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => form.handleUpload(e.target.files, false)}
                          className="text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border file:border-border-medium file:text-xs file:font-semibold file:bg-white hover:file:bg-bg-primary file:cursor-pointer"
                        />
                        {form.mainImageUrl && (
                          <img
                            src={form.mainImageUrl}
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
                          onChange={(e) => form.handleUpload(e.target.files, true)}
                          className="text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border file:border-border-medium file:text-xs file:font-semibold file:bg-white hover:file:bg-bg-primary file:cursor-pointer"
                        />
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {form.galleryUrls.map((url, index) => (
                            <div key={index} className="relative group flex-shrink-0">
                              <img
                                src={url}
                                alt="Gallery item"
                                className="w-10 h-14 object-cover rounded border border-border-subtle"
                              />
                              <button
                                type="button"
                                onClick={() => form.setGalleryUrls((prev) => prev.filter((_, i) => i !== index))}
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
                      value={form.newSizeName}
                      onChange={(e) => form.setNewSizeName(e.target.value)}
                      className="w-1/2 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={form.newSizeStock}
                      onChange={(e) => form.setNewSizeStock(e.target.value)}
                      className="w-1/4 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSizeClick}
                      className="px-4 py-2 bg-bg-ink text-text-inverted rounded-full text-xs hover:bg-text-primary transition-colors cursor-pointer"
                    >
                      Add Size
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.formSizes.length === 0 ? (
                      <div className="text-xs text-text-muted italic">No sizes specified.</div>
                    ) : (
                      form.formSizes.map((s) => (
                        <div key={s.size} className="flex items-center justify-between bg-bg-primary/40 p-2 px-3 border border-border-subtle rounded-lg">
                          <span className="font-mono text-sm font-semibold">{s.size}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary">Stock:</span>
                            <input
                              type="number"
                              value={s.stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (isNaN(val)) return;
                                form.setFormSizes((prev) =>
                                  prev.map((item) => (item.size === s.size ? { ...item, stock: Math.max(0, val) } : item))
                                );
                              }}
                              className="w-16 px-2 py-1 bg-white border border-border-medium rounded text-xs text-center focus:outline-none focus:border-accent-primary"
                            />
                            <button
                              type="button"
                              onClick={() => form.setFormSizes((prev) => prev.filter((item) => item.size !== s.size))}
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
                      value={form.formDetailInput}
                      onChange={(e) => form.setFormDetailInput(e.target.value)}
                      className="flex-1 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddDetailClick}
                      className="px-4 py-2 bg-bg-ink text-text-inverted rounded-full text-xs hover:bg-text-primary transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <ul className="space-y-1.5">
                    {form.formDetails.length === 0 ? (
                      <li className="text-xs text-text-muted italic">No detail bullet points added.</li>
                    ) : (
                      form.formDetails.map((detail, index) => (
                        <li key={index} className="flex items-start justify-between text-xs bg-bg-primary/20 p-2.5 rounded-lg border border-border-subtle">
                          <span className="flex-1 pr-4 text-text-secondary">{detail}</span>
                          <button
                            type="button"
                            onClick={() => form.setFormDetails((prev) => prev.filter((_, i) => i !== index))}
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
                <Button type="button" onClick={onClose} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={form.uploading || form.saving} variant="gold" size="sm">
                  {form.uploading ? "Uploading..." : form.saving ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
