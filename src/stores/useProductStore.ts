/**
 * Aurora — src/stores/useProductStore.ts
 *
 * Zustand store for product detail page UI state — size selection, tab switching,
 * and size guide modal visibility. Transient (no persistence).
 */

import { create } from "zustand";

interface ProductStore {
  selectedSizes: Record<string, string>; // productId -> size
  activeTabs: Record<string, "details" | "shipping">; // productId -> tab
  isSizeGuideOpen: boolean;

  setSelectedSize: (productId: string, size: string) => void;
  setActiveTab: (productId: string, tab: "details" | "shipping") => void;
  setSizeGuideOpen: (isOpen: boolean) => void;
}

/** Transient UI state for product detail interactions. */
export const useProductStore = create<ProductStore>((set) => ({
  selectedSizes: {},
  activeTabs: {},
  isSizeGuideOpen: false,

  setSelectedSize: (productId, size) =>
    set((state) => ({
      selectedSizes: { ...state.selectedSizes, [productId]: size },
    })),

  setActiveTab: (productId, tab) =>
    set((state) => ({
      activeTabs: { ...state.activeTabs, [productId]: tab },
    })),

  setSizeGuideOpen: (isOpen) => set({ isSizeGuideOpen: isOpen }),
}));
