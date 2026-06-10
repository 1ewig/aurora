"use client";

import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { Button } from "@/components/ui/Button";

interface CheckoutFormProps {
  onOrderPlaced?: (
    orderNumber: string,
    maskedEmail: string,
    cardNumber: string,
    maskedCardNumber: string,
    items: any[],
    subtotal: number,
    shipping: number,
    tax: number,
    total: number
  ) => void;
}

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

export function CheckoutForm({ onOrderPlaced }: CheckoutFormProps) {
  const {
    email, setEmail,
    firstName, setFirstName,
    lastName, setLastName,
    address, setAddress,
    city, setCity,
    zipCode, setZipCode,
    cardNumber, setCardNumber,
    cardExpiry, setCardExpiry,
    cardCVC, setCardCVC,
    loading, success, error,
    items,
    handlePlaceOrder,
    fieldErrors, handleBlur, touched,
  } = useCheckoutForm(onOrderPlaced);

  if (success) {
    return null;
  }

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
              required
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

      {/* Mock Payment Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary pb-2 border-b border-border-subtle">
          Payment Details
        </h3>
        <div className="space-y-1">
          <label htmlFor="card-number" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Card Number
          </label>
          <input
            id="card-number"
            type="text"
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            onBlur={() => handleBlur("cardNumber")}
            className={fieldClass(touched.has("cardNumber") && !!fieldErrors.cardNumber)}
            placeholder="4111 2222 3333 4444"
          />
          <FieldError show={touched.has("cardNumber")} message={fieldErrors.cardNumber} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="card-expiry" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Expiration (MM/YY)
            </label>
            <input
              id="card-expiry"
              type="text"
              required
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              onBlur={() => handleBlur("cardExpiry")}
              className={fieldClass(touched.has("cardExpiry") && !!fieldErrors.cardExpiry)}
              placeholder="12/28"
            />
            <FieldError show={touched.has("cardExpiry")} message={fieldErrors.cardExpiry} />
          </div>
          <div className="space-y-1">
            <label htmlFor="card-cvc" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Security Code (CVC)
            </label>
            <input
              id="card-cvc"
              type="text"
              required
              value={cardCVC}
              onChange={(e) => setCardCVC(e.target.value)}
              onBlur={() => handleBlur("cardCVC")}
              className={fieldClass(touched.has("cardCVC") && !!fieldErrors.cardCVC)}
              placeholder="123"
            />
            <FieldError show={touched.has("cardCVC")} message={fieldErrors.cardCVC} />
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
          {loading ? "Processing Order..." : "Place Order"}
        </Button>
      </div>
    </form>
  );
}
