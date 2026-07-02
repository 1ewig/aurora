/**
 * Aurora — src/hooks/useCheckoutForm.ts
 *
 * Checkout form state management for Lemon Squeezy sandbox payments:
 * - Collects and validates shipping address.
 * - Programmatically initiates checkout sessions.
 * - Integrates with LemonSqueezy client overlay modal.
 */

import { useState, useCallback, useEffect } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { validateField, validateAll, type FieldErrors } from "@/utils/validation";

export function useCheckoutForm() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const clearCart = useCartStore((s) => s.clearCart);
  const items = useCartStore((s) => s.items);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Prefill email and name if user is logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (profile?.displayName && !firstName && !lastName) {
      const parts = profile.displayName.trim().split(/\s+/);
      if (parts.length > 0) setFirstName(parts[0]);
      if (parts.length > 1) setLastName(parts.slice(1).join(" "));
    }
  }, [user, profile]);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const handleBlur = useCallback((field: string) => {
    markTouched(field);
  }, [markTouched]);

  const setAndValidate = useCallback((field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    setFieldErrors((prev) => {
      const error = validateField(field, value);
      return { ...prev, [field]: error };
    });
  }, []);

  const fields: Record<string, string> = {
    email, firstName, lastName, address, city, zipCode,
  };

  const maskEmail = (rawEmail: string) => {
    const [name, domain] = rawEmail.split("@");
    if (!domain) return rawEmail;
    const maskedName = name[0] + "***" + name[name.length - 1];
    return `${maskedName}@${domain}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const allTouched = new Set(Object.keys(fields));
    setTouched(allTouched);

    const errors = validateAll(fields);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    const cartItemsSnapshot = items.map((item) => ({ ...item }));
    const cartItemsPayload = items.map((item) => ({
      internalProductId: item.id,
      quantity: item.quantity,
      size: item.size,
    }));

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItemsPayload,
          shippingAddress: {
            email,
            firstName,
            lastName,
            address,
            city,
            zipCode,
          },
        }),
      });

      if (!res.ok) {
        let errMsg = "Failed to create checkout session.";
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {
          errMsg = `HTTP error ${res.status}: ${res.statusText || "Server error"}`;
        }
        throw new Error(errMsg);
      }
      const data = await res.json();

      setLoading(false);

      // Store the checkout data in sessionStorage in case they get redirected
      const subtotal = cartItemsSnapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      const total = subtotal + shipping + tax;

      const checkoutData = {
        orderNumber: "Pending Fulfillment",
        email,
        maskedEmail: maskEmail(email),
        cardNumber: "•••• •••• •••• 4242",
        maskedCardNumber: "•••• •••• •••• 4242",
        items: cartItemsSnapshot,
        subtotal,
        shipping,
        tax,
        total,
      };
      sessionStorage.setItem("ls_checkout_data", JSON.stringify(checkoutData));

      // Re-initialize overlay script manually
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }

      // Configure the event handler to capture success events from the iframe
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Setup({
          eventHandler: (event) => {
            if (event.event === "Checkout.Success") {
              clearCart();
              queryClient.invalidateQueries({ queryKey: ["orders"] });
            }
          }
        });

        // Open the Lemon Squeezy overlay modal directly
        window.LemonSqueezy.Url.Open(data.checkoutUrl);
      } else {
        // Fallback redirect if Overlay fails to initialize
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return {
    email,
    setEmail: (v: string) => setAndValidate("email", v, setEmail),
    firstName,
    setFirstName: (v: string) => setAndValidate("firstName", v, setFirstName),
    lastName,
    setLastName: (v: string) => setAndValidate("lastName", v, setLastName),
    address,
    setAddress: (v: string) => setAndValidate("address", v, setAddress),
    city,
    setCity: (v: string) => setAndValidate("city", v, setCity),
    zipCode,
    setZipCode: (v: string) => setAndValidate("zipCode", v, setZipCode),
    loading, items, handlePlaceOrder,
    error, setError,
    fieldErrors, handleBlur, touched,
  };
}
