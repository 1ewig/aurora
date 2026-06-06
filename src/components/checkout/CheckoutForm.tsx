"use client";

import { motion } from "framer-motion";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { Button } from "@/components/ui/Button";

export function CheckoutForm() {
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
    loading, orderNumber, success,
    items,
    handlePlaceOrder,
    maskEmail,
    maskCardNumber,
  } = useCheckoutForm();

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-center py-12 px-6 bg-white rounded-2xl border border-border-subtle shadow-sm"
      >
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="bg-accent-secondary/20 border border-accent-primary/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Demo Site Notice
          </p>
          <p className="text-xs text-text-secondary mt-1">
            This is a dummy e-commerce site built for learning purposes. No real order has been placed.
          </p>
        </div>
        <h2 className="font-display font-black text-3xl tracking-tight text-text-primary">
          Order Received
        </h2>
        <p className="text-text-secondary max-w-md mx-auto text-sm md:text-base leading-relaxed">
          Thank you for your purchase. We are preparing your order. An confirmation containing details and tracking has been sent to:
          <span className="block font-medium text-text-primary mt-1">{maskEmail(email)}</span>
        </p>
        <div className="bg-bg-primary py-4 px-6 rounded-lg max-w-xs mx-auto border border-border-subtle font-mono text-sm space-y-1">
          <span className="text-text-muted text-xs uppercase tracking-wider block">Reference Number</span>
          <span className="text-text-primary font-bold">{orderNumber}</span>
        </div>
        {cardNumber && (
          <p className="text-xs text-text-muted">
            Charged to: <span className="font-mono">{maskCardNumber(cardNumber)}</span>
          </p>
        )}
        <div className="pt-6">
          <a href="/products">
            <Button variant="ghost" size="md">
              Return to Catalog
            </Button>
          </a>
        </div>
      </motion.div>
    );
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
            className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
            placeholder="johndoe@example.com"
          />
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
              className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
            />
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
              className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
            />
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
            className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
          />
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
              className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
            />
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
              className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
            />
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
            className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
            placeholder="4111 2222 3333 4444"
          />
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
              className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
              placeholder="12/28"
            />
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
              className="w-full px-4 py-3 rounded-md bg-white border border-border-subtle focus:border-accent-primary focus:outline-none transition-colors text-sm text-text-primary"
              placeholder="123"
            />
          </div>
        </div>
      </div>

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
