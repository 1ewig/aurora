/**
 * Aurora — src/utils/sanitize.ts
 *
 * Input sanitization utilities for shipping addresses and cart items.
 * Used by the checkout session and webhook endpoints to strip HTML
 * tags and enforce length limits before persisting data.
 *
 * NOTE: The HTML-stripping regex (<[^>]*>) is a basic XSS mitigation.
 * It handles typical injection attempts but is not a full HTML sanitizer.
 * All address data is rendered as plain text (not dangerouslySetInnerHTML)
 * so the risk is low.
 */

import { isValidEmail } from "./validation";

export interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface VerifiedItem {
  id: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

/** Strips HTML tags, trims, and truncates to 200 chars. */
export function sanitize(s: string): string {
  return s.trim().replace(/<[^>]*>/g, "").slice(0, 200);
}

/** Sanitizes all fields of a raw shipping address object. */
export function sanitizeShippingAddress(raw: Record<string, any>): ShippingAddress {
  return {
    email: (raw.email || "").trim(),
    firstName: sanitize(raw.firstName || ""),
    lastName: sanitize(raw.lastName || ""),
    address: sanitize(raw.address || ""),
    city: sanitize(raw.city || ""),
    zipCode: (raw.zipCode || "").trim(),
  };
}

/** Validates that all required shipping address fields are present and email is valid. */
export function validateShippingAddress(address: Record<string, any>): string | null {
  const fields: [string, string][] = [
    ["email", "email"],
    ["firstName", "first name"],
    ["lastName", "last name"],
    ["address", "address"],
    ["city", "city"],
    ["zipCode", "ZIP code"],
  ];
  for (const [key, label] of fields) {
    if (!address[key]?.toString().trim()) {
      return `${label} is required`;
    }
  }

  if (!isValidEmail(address.email?.toString() || "")) {
    return "Enter a valid email address";
  }

  return null;
}
