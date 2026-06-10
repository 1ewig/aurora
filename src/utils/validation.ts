export interface FieldErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
}

export function validateField(field: string, value: string): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case "email": {
      if (!trimmed) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
      return undefined;
    }
    case "firstName": {
      if (!trimmed) return "First name is required.";
      if (trimmed.length < 2) return "First name must be at least 2 characters.";
      return undefined;
    }
    case "lastName": {
      if (!trimmed) return "Last name is required.";
      if (trimmed.length < 2) return "Last name must be at least 2 characters.";
      return undefined;
    }
    case "address": {
      if (!trimmed) return "Street address is required.";
      return undefined;
    }
    case "city": {
      if (!trimmed) return "City is required.";
      return undefined;
    }
    case "zipCode": {
      if (!trimmed) return "Postal / ZIP code is required.";
      if (!/^\d{5}(-\d{4})?$/.test(trimmed)) return "Enter a valid ZIP code (e.g. 10001 or 10001-1234).";
      return undefined;
    }
    case "cardNumber": {
      const cleaned = trimmed.replace(/\s/g, "");
      if (!cleaned) return "Card number is required.";
      if (!/^\d{13,19}$/.test(cleaned)) return "Enter a valid card number.";
      return undefined;
    }
    case "cardExpiry": {
      if (!trimmed) return "Expiration date is required.";
      if (!/^\d{2}\/\d{2}$/.test(trimmed)) return "Use MM/YY format (e.g. 12/28).";
      const [mm, yy] = trimmed.split("/").map(Number);
      if (mm < 1 || mm > 12) return "Month must be 01–12.";
      const now = new Date();
      const expYear = 2000 + yy;
      const expMonth = mm - 1;
      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth())) {
        return "Card is expired.";
      }
      return undefined;
    }
    case "cardCVC": {
      if (!trimmed) return "Security code is required.";
      if (!/^\d{3,4}$/.test(trimmed)) return "CVC must be 3 or 4 digits.";
      return undefined;
    }
    default:
      return undefined;
  }
}

export function validateAll(values: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of Object.keys(values)) {
    const error = validateField(field, values[field]);
    if (error) (errors as any)[field] = error;
  }
  return errors;
}
