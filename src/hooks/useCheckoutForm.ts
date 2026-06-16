/**
 * Aurora — src/hooks/useCheckoutForm.ts
 *
 * Checkout form state management with validation, auto-prefill for logged-in users,
 * order submission, and post-order cleanup (cart clear, query invalidation).
 */

import { useState, useCallback, useEffect } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { validateField, validateAll, type FieldErrors } from "@/utils/validation";

export function useCheckoutForm(onOrderPlaced?: (
  orderNumber: string,
  maskedEmail: string,
  cardNumber: string,
  maskedCardNumber: string,
  items: any[],
  subtotal: number,
  shipping: number,
  tax: number,
  total: number
) => void) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const clearCart = useCartStore((s) => s.clearCart);
  const items = useCartStore((s) => s.items);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [success, setSuccess] = useState(false);
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
    email, firstName, lastName, address, city, zipCode, cardNumber, cardExpiry, cardCVC,
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

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;

    const itemsSnapshot = items.map((item) => ({ ...item }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsSnapshot,
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      const orderNum = data.orderNumber || "";
      setOrderNumber(orderNum);
      setSuccess(true);
      setLoading(false);

      onOrderPlaced?.(
        orderNum,
        maskEmail(email),
        cardNumber,
        maskCardNumber(cardNumber),
        itemsSnapshot,
        data.subtotal ?? subtotal,
        data.shipping ?? shipping,
        data.tax ?? tax,
        data.total ?? total
      );

      clearCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const maskEmail = (rawEmail: string) => {
    const [name, domain] = rawEmail.split("@");
    if (!domain) return rawEmail;
    const maskedName = name[0] + "***" + name[name.length - 1];
    return `${maskedName}@${domain}`;
  };

  const maskCardNumber = (rawCard: string) => {
    const cleaned = rawCard.replace(/\s+/g, "");
    if (cleaned.length < 4) return "****";
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
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
    cardNumber,
    setCardNumber: (v: string) => setAndValidate("cardNumber", v, setCardNumber),
    cardExpiry,
    setCardExpiry: (v: string) => setAndValidate("cardExpiry", v, setCardExpiry),
    cardCVC,
    setCardCVC: (v: string) => setAndValidate("cardCVC", v, setCardCVC),
    loading, orderNumber, success, items, handlePlaceOrder,
    error, setError,
    fieldErrors, handleBlur, touched,
  };
}
