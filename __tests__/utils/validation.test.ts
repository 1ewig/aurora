import { describe, it, expect } from "vitest";
import { validateField, validateAll } from "@/utils/validation";

describe("validateField", () => {
  describe("email", () => {
    it("returns undefined for valid email", () => {
      expect(validateField("email", "test@example.com")).toBeUndefined();
    });

    it("returns error for empty email", () => {
      expect(validateField("email", "")).toBe("Email is required.");
    });

    it("returns error for invalid email format", () => {
      expect(validateField("email", "not-an-email")).toBe(
        "Enter a valid email address."
      );
    });

    it("trims whitespace before validation", () => {
      expect(validateField("email", "  test@example.com  ")).toBeUndefined();
    });
  });

  describe("firstName", () => {
    it("returns undefined for valid name", () => {
      expect(validateField("firstName", "John")).toBeUndefined();
    });

    it("returns error for empty name", () => {
      expect(validateField("firstName", "")).toBe("First name is required.");
    });

    it("returns error for single character", () => {
      expect(validateField("firstName", "J")).toBe(
        "First name must be at least 2 characters."
      );
    });
  });

  describe("lastName", () => {
    it("returns undefined for valid name", () => {
      expect(validateField("lastName", "Doe")).toBeUndefined();
    });

    it("returns undefined when empty (optional field)", () => {
      expect(validateField("lastName", "")).toBeUndefined();
    });

    it("returns error for single character", () => {
      expect(validateField("lastName", "D")).toBe(
        "Last name must be at least 2 characters."
      );
    });
  });

  describe("address", () => {
    it("returns undefined for valid address", () => {
      expect(validateField("address", "123 Main St")).toBeUndefined();
    });

    it("returns error for empty address", () => {
      expect(validateField("address", "")).toBe("Street address is required.");
    });
  });

  describe("city", () => {
    it("returns undefined for valid city", () => {
      expect(validateField("city", "New York")).toBeUndefined();
    });

    it("returns error for empty city", () => {
      expect(validateField("city", "")).toBe("City is required.");
    });
  });

  describe("zipCode", () => {
    it("returns undefined for valid 5-digit ZIP", () => {
      expect(validateField("zipCode", "10001")).toBeUndefined();
    });

    it("returns undefined for valid ZIP+4", () => {
      expect(validateField("zipCode", "10001-1234")).toBeUndefined();
    });

    it("returns error for empty ZIP", () => {
      expect(validateField("zipCode", "")).toBe(
        "Postal / ZIP code is required."
      );
    });

    it("returns error for non-numeric ZIP", () => {
      expect(validateField("zipCode", "ABCDE")).toBe(
        "Enter a valid ZIP code (e.g. 10001 or 10001-1234)."
      );
    });

    it("returns error for too-short ZIP", () => {
      expect(validateField("zipCode", "123")).toBe(
        "Enter a valid ZIP code (e.g. 10001 or 10001-1234)."
      );
    });
  });

  describe("cardNumber", () => {
    it("returns undefined for valid card number", () => {
      expect(
        validateField("cardNumber", "4242424242424242")
      ).toBeUndefined();
    });

    it("allows spaces in input", () => {
      expect(
        validateField("cardNumber", "4242 4242 4242 4242")
      ).toBeUndefined();
    });

    it("returns error for empty card number", () => {
      expect(validateField("cardNumber", "")).toBe(
        "Card number is required."
      );
    });

    it("returns error for too-short number", () => {
      expect(validateField("cardNumber", "123")).toBe(
        "Enter a valid card number."
      );
    });
  });

  describe("cardExpiry", () => {
    it("returns undefined for valid future expiry", () => {
      const futureYear = String(new Date().getFullYear() + 1).slice(2);
      expect(validateField("cardExpiry", `12/${futureYear}`)).toBeUndefined();
    });

    it("returns error for empty expiry", () => {
      expect(validateField("cardExpiry", "")).toBe(
        "Expiration date is required."
      );
    });

    it("returns error for wrong format", () => {
      expect(validateField("cardExpiry", "12-28")).toBe(
        "Use MM/YY format (e.g. 12/28)."
      );
    });

    it("returns error for invalid month", () => {
      expect(validateField("cardExpiry", "13/28")).toBe(
        "Month must be 01–12."
      );
    });

    it("returns error for zero month", () => {
      expect(validateField("cardExpiry", "00/28")).toBe(
        "Month must be 01–12."
      );
    });

    it("returns error for expired date", () => {
      expect(validateField("cardExpiry", "01/20")).toBe("Card is expired.");
    });
  });

  describe("cardCVC", () => {
    it("returns undefined for valid 3-digit CVC", () => {
      expect(validateField("cardCVC", "123")).toBeUndefined();
    });

    it("returns undefined for valid 4-digit CVC", () => {
      expect(validateField("cardCVC", "1234")).toBeUndefined();
    });

    it("returns error for empty CVC", () => {
      expect(validateField("cardCVC", "")).toBe("Security code is required.");
    });

    it("returns error for non-numeric CVC", () => {
      expect(validateField("cardCVC", "abc")).toBe(
        "CVC must be 3 or 4 digits."
      );
    });

    it("returns error for 2-digit CVC", () => {
      expect(validateField("cardCVC", "12")).toBe(
        "CVC must be 3 or 4 digits."
      );
    });
  });

  describe("unknown field", () => {
    it("returns undefined", () => {
      expect(validateField("unknownField", "value")).toBeUndefined();
    });
  });
});

describe("validateAll", () => {
  it("returns empty errors for all valid fields", () => {
    const errors = validateAll({
      email: "test@example.com",
      firstName: "John",
    });
    expect(errors).toEqual({});
  });

  it("returns errors for invalid fields", () => {
    const errors = validateAll({
      email: "",
      firstName: "J",
    });
    expect(errors.email).toBe("Email is required.");
    expect(errors.firstName).toBe("First name must be at least 2 characters.");
  });

  it("ignores unknown fields", () => {
    const errors = validateAll({
      email: "test@example.com",
      unknownField: "value",
    });
    expect(errors).toEqual({});
  });
});
