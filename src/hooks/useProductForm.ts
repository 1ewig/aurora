import { useState, useEffect } from "react";
import { useInsforgeClient } from "@/lib/insforge";
import { useAdminStore, type ProductData, type SizeStock } from "@/stores/useAdminStore";

export function useProductForm(onSuccess: () => void) {
  const saveProduct = useAdminStore((s) => s.saveProduct);
  const { client: insforge, isReady } = useInsforgeClient();

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

  const [mainImageUrl, setMainImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    } else {
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
  }

  // Upload to bucket
  async function handleUpload(files: FileList | null, isGallery = false) {
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
      await saveProduct(payload, editingProduct ? editingProduct.id : undefined);
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
    resetForm,
    handleUpload,
    handleSave,
    handleAddDetail,
    handleAddSize,
  };
}
