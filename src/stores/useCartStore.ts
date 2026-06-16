/**
 * Aurora — src/stores/useCartStore.ts
 *
 * Zustand store for shopping cart state with localStorage persistence.
 * Tracks items, quantities, and cart drawer open/close state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A single line item in the shopping cart. */
export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

/** Persisted cart store synced to localStorage. */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      /** Adds a product or increments quantity if same ID + size already in cart. */
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === product.id && i.size === product.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id && i.size === product.size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),

      /** Removes a specific product+size combination from the cart. */
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        })),

      /** Updates the quantity for a specific product+size. */
      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "aurora-cart" }
  )
);
