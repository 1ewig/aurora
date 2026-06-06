import { create } from "zustand";

interface ProductStore {
  selectedSizes: Record<string, string>; // productId -> size
  activeTabs: Record<string, "details" | "shipping">; // productId -> tab
  isSizeGuideOpen: boolean;
  addedProducts: Record<string, boolean>; // productId -> boolean

  setSelectedSize: (productId: string, size: string) => void;
  setActiveTab: (productId: string, tab: "details" | "shipping") => void;
  setSizeGuideOpen: (isOpen: boolean) => void;
  addToBag: (productId: string, addItemFn: () => void) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  selectedSizes: {},
  activeTabs: {},
  isSizeGuideOpen: false,
  addedProducts: {},

  setSelectedSize: (productId, size) =>
    set((state) => ({
      selectedSizes: { ...state.selectedSizes, [productId]: size },
      // Automatically reset added status back to "Add to Bag" when size changes
      addedProducts: { ...state.addedProducts, [productId]: false },
    })),

  setActiveTab: (productId, tab) =>
    set((state) => ({
      activeTabs: { ...state.activeTabs, [productId]: tab },
    })),

  setSizeGuideOpen: (isOpen) => set({ isSizeGuideOpen: isOpen }),

  addToBag: (productId, addItemFn) => {
    const isAlreadyAdded = get().addedProducts[productId];
    // Prevent adding again if already in "Added!" state
    if (isAlreadyAdded) return;

    addItemFn();

    set((state) => ({
      addedProducts: { ...state.addedProducts, [productId]: true },
    }));

    // Automatically revert the button text back after 2 seconds
    setTimeout(() => {
      set((state) => ({
        addedProducts: { ...state.addedProducts, [productId]: false },
      }));
    }, 2000);
  },
}));
