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
import { useSearchParams } from "next/navigation";

interface CheckoutData {
  orderNumber: string;
  email: string;
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
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

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

  // Poll for the actual order number from the database using the Lemon Squeezy order_id
  useEffect(() => {
    if (!orderId || !orderData) return;

    let attempts = 0;
    const maxAttempts = 10;
    let timerId: NodeJS.Timeout;

    async function poll() {
      try {
        const res = await fetch(`/api/orders?lsOrderId=${encodeURIComponent(orderId || "")}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.orderNumber) {
            setOrderData((prev) => {
              if (!prev) return null;
              return { ...prev, orderNumber: data.orderNumber };
            });
            return; // Success, stop polling
          }
        }
      } catch (err) {
        console.error("Error looking up order number:", err);
      }

      attempts++;
      if (attempts < maxAttempts) {
        timerId = setTimeout(poll, 1500); // retry after 1.5s
      }
    }

    timerId = setTimeout(poll, 1000); // start after 1s

    return () => clearTimeout(timerId);
  }, [orderId, orderData === null]);

  return {
    orderData,
    isLoaded,
    user,
  };
}
