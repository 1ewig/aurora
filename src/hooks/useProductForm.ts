/**
 * Aurora — src/hooks/useProductForm.ts
 *
 * Admin product form state — fields, image upload, size/detail management,
 * change detection, and save logic.
 */

import { useState, useEffect } from "react";
import { useInsforgeClient } from "@/lib/insforge";
import { useSaveProductMutation } from "@/hooks/queries";
import type { ProductData, SizeStock } from "@/stores/useAdminStore";

/** Admin product form state and handlers for create/edit workflow. */
export function useProductForm(onSuccess: () => void) {
  const saveMutation = useSaveProductMutation();
  const { client: insforge, isReady } = useInsforgeClient();

  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState<string>("Outerwear");
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

  const [mainImageUrl, setMainImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Snapshot for change detection
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  function currentSnapshot() {
    return JSON.stringify({
      id: formId,
      name: formName,
      slug: formSlug,
      category: formCategory,
      price: formPrice,
      badge: formBadge,
      altText: formAltText,
      span: formSpan,
      aspectRatio: formAspectRatio,
      description: formDescription,
      details: formDetails,
      sizes: formSizes,
      image: mainImageUrl,
      images: galleryUrls,
    });
  }

  const hasChanges = currentSnapshot() !== initialSnapshot;

  // Sync auto slug
  useEffect(() => {
    if (!formId && formName) {
      const slugified = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(slugified);
    }
  }, [formName, formId]);

  // Load editing product properties
  function resetForm(product?: ProductData | null) {
    if (product) {
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
      setInitialSnapshot(
        JSON.stringify({
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: String(product.price),
          badge: product.badge || "",
          altText: product.altText || "",
          span: product.span || "",
          aspectRatio: product.aspectRatio || "",
          description: product.description || "",
          details: product.details || [],
          sizes: product.sizes || [],
          image: product.image,
          images: product.images || [],
        })
      );
    } else {
      setFormId("");
      setFormName("");
      setFormSlug("");
      setFormCategory("Outerwear");
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
      setInitialSnapshot(
        JSON.stringify({
          id: "",
          name: "",
          slug: "",
          category: "Outerwear",
          price: "",
          badge: "",
          altText: "",
          span: "",
          aspectRatio: "",
          description: "",
          details: [],
          sizes: [
            { size: "S", stock: 10 },
            { size: "M", stock: 10 },
            { size: "L", stock: 10 },
          ],
          image: "",
          images: [],
        })
      );
    }
  }

  // Upload to bucket
  async function handleUpload(files: FileList | null, isGallery = false) {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const idForPath = formId.trim() || "temp";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const key = `${idForPath}/${safeName}`;

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
        setGalleryUrls((prev) => {
          const newUrl = validUrls[0] || "";
          const filtered = prev.filter((u) => u !== newUrl);
          return [newUrl, ...filtered];
        });
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(editingProduct: ProductData | null) {
    if (!formId.trim()) {
      alert("Product ID is required");
      return;
    }
    if (!mainImageUrl) {
      alert("Main image is required");
      return;
    }

    setSaving(true);
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
      await saveMutation.mutateAsync({ product: payload, id: editingProduct?.id });
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  // Add detail bullet
  function handleAddDetail() {
    if (formDetailInput.trim()) {
      setFormDetails((prev) => [...prev, formDetailInput.trim()]);
      setFormDetailInput("");
    }
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

  return {
    formId, setFormId,
    formName, setFormName,
    formSlug, setFormSlug,
    formCategory, setFormCategory,
    formPrice, setFormPrice,
    formBadge, setFormBadge,
    formAltText, setFormAltText,
    formSpan, setFormSpan,
    formAspectRatio, setFormAspectRatio,
    formDescription, setFormDescription,
    formDetailInput, setFormDetailInput,
    formDetails, setFormDetails,
    formSizes, setFormSizes,
    newSizeName, setNewSizeName,
    newSizeStock, setNewSizeStock,
    mainImageUrl, setMainImageUrl,
    galleryUrls, setGalleryUrls,
    uploading,
    saving,
    isReady,
    hasChanges,
    resetForm,
    handleUpload,
    handleSave,
    handleAddDetail,
    handleAddSize,
  };
}
