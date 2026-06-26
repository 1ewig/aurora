/**
 * Aurora — src/hooks/useCheckoutSuccess.ts
 *
 * Hook to manage checkout success state:
 * - Clears the cart on mount.
 * - Extracts and parses checkout data from sessionStorage.
 * - Resolves user login state.
 */

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface CheckoutData {
  orderNumber: string;
  maskedEmail: string;
  cardNumber?: string;
  maskedCardNumber?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function useCheckoutSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);

  const [orderData, setOrderData] = useState<CheckoutData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Clear cart on mount to ensure user's cart is empty after checkout success redirection
    clearCart();

    // Check for detailed checkout data in sessionStorage
    const raw = sessionStorage.getItem("ls_checkout_data");
    if (raw) {
      try {
        setOrderData(JSON.parse(raw));
        // Remove it immediately to prevent displaying the receipt again on direct subsequent reloads
        sessionStorage.removeItem("ls_checkout_data");
      } catch (e) {
        console.error("Failed to parse ls_checkout_data", e);
      }
    }
    setIsLoaded(true);
  }, [clearCart]);

  return {
    orderData,
    isLoaded,
    user,
  };
}
