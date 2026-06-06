"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface CheckoutSuccessProps {
  orderNumber: string;
  maskedEmail: string;
  cardNumber: string;
  maskedCardNumber: string;
}

export function CheckoutSuccess({
  orderNumber,
  maskedEmail,
  cardNumber,
  maskedCardNumber,
}: CheckoutSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6 text-center py-12 px-6 bg-white rounded-2xl border border-border-subtle shadow-sm"
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
        <span className="block font-medium text-text-primary mt-1">{maskedEmail}</span>
      </p>
      <div className="bg-bg-primary py-4 px-6 rounded-lg max-w-xs mx-auto border border-border-subtle font-mono text-sm space-y-1">
        <span className="text-text-muted text-xs uppercase tracking-wider block">Reference Number</span>
        <span className="text-text-primary font-bold">{orderNumber}</span>
      </div>
      {cardNumber && (
        <p className="text-xs text-text-muted">
          Charged to: <span className="font-mono">{maskedCardNumber}</span>
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
