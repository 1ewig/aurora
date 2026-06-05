"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/hooks/useCartStore";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatCurrency } from "@/utils/formatCurrency";
import { drawerSlide } from "@/animations/variants";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const count = totalItems();
  const total = totalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            variants={drawerSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#E8E8E4]">
              <h2 className="font-medium text-[#111111] text-base">
                Shopping Bag{" "}
                <span className="text-[#ABABAB] font-normal">({count})</span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="p-2 hover:bg-[#F7F7F5] rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <p className="text-[#6B6B6B]">Your bag is empty.</p>
                  <p className="text-sm text-[#ABABAB]">
                    Add something beautiful to continue.
                  </p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li
                      key={`${item.id}-${item.size}`}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F7F5] relative">
                        <OptimizedImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#111111] text-sm leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[#ABABAB] text-xs mt-1">
                          Size: {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(
                                      item.id,
                                      item.size,
                                      item.quantity - 1
                                    )
                                  : removeItem(item.id, item.size)
                              }
                              className="w-7 h-7 rounded-full border border-[#E8E8E4] flex items-center justify-center text-sm hover:border-[#111111] transition-colors"
                            >
                              −
                            </button>
                            <span className="text-sm w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.size,
                                  item.quantity + 1
                                )
                              }
                              className="w-7 h-7 rounded-full border border-[#E8E8E4] flex items-center justify-center text-sm hover:border-[#111111] transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-mono text-sm font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[#ABABAB] hover:text-[#111111] transition-colors self-start mt-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-6 border-t border-[#E8E8E4]">
                <div className="flex justify-between mb-6">
                  <span className="text-[#6B6B6B]">Total</span>
                  <span className="font-mono font-medium text-[#111111]">
                    {formatCurrency(total)}
                  </span>
                </div>
                <button className="w-full py-4 rounded-full bg-[#0D0D0D] text-[#F7F7F5] font-medium hover:bg-[#111111] transition-colors">
                  Checkout →
                </button>
                <p className="text-center text-xs text-[#ABABAB] mt-3">
                  Complimentary shipping on orders over $500
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
