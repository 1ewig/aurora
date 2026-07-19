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

export function sanitize(s: string): string {
  return s.trim().replace(/<[^>]*>/g, "").slice(0, 200);
}

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
