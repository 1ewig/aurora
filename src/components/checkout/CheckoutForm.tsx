/**
 * Aurora — src/components/checkout/CheckoutForm.tsx
 *
 * Client-side checkout form that collects contact, shipping, and mock payment
 * details. Integrates with the useCheckoutForm hook for validation and submission.
 */
"use client";

import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { Button } from "@/components/ui/Button";

function fieldClass(hasError: boolean) {
  return `w-full px-4 py-3 rounded-md bg-white border focus:outline-none transition-colors text-sm text-text-primary ${
    hasError
      ? "border-error focus:border-error"
      : "border-border-subtle focus:border-accent-primary"
  }`;
}

function FieldError({ show, message }: { show: boolean; message?: string }) {
  if (!show || !message) return null;
  return <p className="text-error text-[11px] mt-1">{message}</p>;
}

/** Checkout form — contact info, shipping address, and mock credit-card fields with validation. */
export function CheckoutForm() {
  const {
    email, setEmail,
    firstName, setFirstName,
    lastName, setLastName,
    address, setAddress,
    city, setCity,
    zipCode, setZipCode,
    loading, error,
    items,
    handlePlaceOrder,
    fieldErrors, handleBlur, touched,
  } = useCheckoutForm();

  if (items.length === 0) {
    return null;
  }

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-8">
      {/* Contact Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary pb-2 border-b border-border-subtle">
          Contact Information
        </h3>
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            className={fieldClass(touched.has("email") && !!fieldErrors.email)}
            placeholder="johndoe@example.com"
          />
          <FieldError show={touched.has("email")} message={fieldErrors.email} />
        </div>
      </div>

      {/* Shipping Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary pb-2 border-b border-border-subtle">
          Shipping Address
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="first-name" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur("firstName")}
              className={fieldClass(touched.has("firstName") && !!fieldErrors.firstName)}
            />
            <FieldError show={touched.has("firstName")} message={fieldErrors.firstName} />
          </div>
          <div className="space-y-1">
            <label htmlFor="last-name" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur("lastName")}
              className={fieldClass(touched.has("lastName") && !!fieldErrors.lastName)}
            />
            <FieldError show={touched.has("lastName")} message={fieldErrors.lastName} />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="address" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Street Address
          </label>
          <input
            id="address"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => handleBlur("address")}
            className={fieldClass(touched.has("address") && !!fieldErrors.address)}
          />
          <FieldError show={touched.has("address")} message={fieldErrors.address} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="city" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              City
            </label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onBlur={() => handleBlur("city")}
              className={fieldClass(touched.has("city") && !!fieldErrors.city)}
            />
            <FieldError show={touched.has("city")} message={fieldErrors.city} />
          </div>
          <div className="space-y-1">
            <label htmlFor="zip" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Postal / ZIP Code
            </label>
            <input
              id="zip"
              type="text"
              required
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onBlur={() => handleBlur("zipCode")}
              className={fieldClass(touched.has("zipCode") && !!fieldErrors.zipCode)}
              placeholder="10001"
            />
            <FieldError show={touched.has("zipCode")} message={fieldErrors.zipCode} />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-error text-xs font-medium px-1">{error}</div>
      )}

      {/* Checkout Submit CTA */}
      <div className="pt-4">
        <Button
          variant="filled"
          size="lg"
          fullWidth
          disabled={loading}
          className="py-4 font-semibold uppercase tracking-wider text-xs"
        >
          {loading ? "Redirecting to Payment..." : "Proceed to Payment"}
        </Button>
      </div>
    </form>
  );
}
