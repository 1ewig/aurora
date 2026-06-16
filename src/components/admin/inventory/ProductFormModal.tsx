"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { type ProductData } from "@/stores/useAdminStore";
import { type useProductForm } from "@/hooks/useProductForm";
import { BasicDetailsFields } from "./BasicDetailsFields";
import { MediaUploadFields } from "./MediaUploadFields";
import { SizeStockFields } from "./SizeStockFields";
import { BulletDetailsFields } from "./BulletDetailsFields";

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
            className="relative w-full max-w-4xl bg-bg-secondary border border-border-subtle rounded-[24px] shadow-2xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSave(editingProduct);
              }}
              className="flex flex-col max-h-[85vh]"
            >
              {/* Sticky Header */}
              <div className="flex-shrink-0 px-6 sm:px-6 py-4 sm:py-4 border-b border-border-subtle">
                <h2 className="font-display font-black text-2xl uppercase tracking-wider truncate">
                  {editingProduct ? `Edit — ${editingProduct.name}` : "Add New Product"}
                </h2>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BasicDetailsFields
                    editingProduct={!!editingProduct}
                    formId={form.formId}
                    onFormIdChange={form.setFormId}
                    formName={form.formName}
                    onFormNameChange={form.setFormName}
                    formSlug={form.formSlug}
                    onFormSlugChange={form.setFormSlug}
                    formCategory={form.formCategory}
                    onFormCategoryChange={form.setFormCategory}
                    formPrice={form.formPrice}
                    onFormPriceChange={form.setFormPrice}
                    formBadge={form.formBadge}
                    onFormBadgeChange={form.setFormBadge}
                    formSpan={form.formSpan}
                    onFormSpanChange={form.setFormSpan}
                    formAspectRatio={form.formAspectRatio}
                    onFormAspectRatioChange={form.setFormAspectRatio}
                    formAltText={form.formAltText}
                    onFormAltTextChange={form.setFormAltText}
                  />

                  <MediaUploadFields
                    formDescription={form.formDescription}
                    onFormDescriptionChange={form.setFormDescription}
                    uploading={form.uploading}
                    isReady={form.isReady}
                    mainImageUrl={form.mainImageUrl}
                    onUpload={form.handleUpload}
                    galleryUrls={form.galleryUrls}
                    onRemoveGalleryImage={(index) =>
                      form.setGalleryUrls((prev) => prev.filter((_, i) => i !== index))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                  <SizeStockFields
                    newSizeName={form.newSizeName}
                    onNewSizeNameChange={form.setNewSizeName}
                    newSizeStock={form.newSizeStock}
                    onNewSizeStockChange={form.setNewSizeStock}
                    onAddSize={form.handleAddSize}
                    formSizes={form.formSizes}
                    onStockChange={(size, stock) =>
                      form.setFormSizes((prev) =>
                        prev.map((item) => (item.size === size ? { ...item, stock } : item))
                      )
                    }
                    onRemoveSize={(size) =>
                      form.setFormSizes((prev) => prev.filter((item) => item.size !== size))
                    }
                  />

                  <BulletDetailsFields
                    formDetailInput={form.formDetailInput}
                    onFormDetailInputChange={form.setFormDetailInput}
                    onAddDetail={form.handleAddDetail}
                    formDetails={form.formDetails}
                    onRemoveDetail={(index) =>
                      form.setFormDetails((prev) => prev.filter((_, i) => i !== index))
                    }
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 sm:px-6 py-4 sm:py-4 border-t border-border-subtle">
                <Button type="button" onClick={onClose} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={!form.hasChanges || form.uploading || form.saving} variant="gold" size="sm">
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
