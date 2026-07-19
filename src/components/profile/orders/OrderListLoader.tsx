/**
 * Aurora — src/components/profile/orders/OrderListLoader.tsx
 *
 * Premium luxury brand loader for the purchase history page.
 * Replaces the static skeletons with custom rotating rings and glowing graphics.
 */

"use client";

import { motion } from "framer-motion";

export function OrderListLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[45vh]">
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center select-none pointer-events-none">
        {/* Glowing Aura backdrop */}
        <motion.div
          className="absolute inset-0 bg-accent-primary/10 rounded-full blur-md"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Outer spin ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-accent-primary border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Inner counter-spin ring */}
        <motion.div
          className="absolute w-12 h-12 rounded-full border-b-2 border-l-2 border-accent-secondary border-t-transparent border-r-transparent"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Center brand mark */}
        <span className="font-display font-black text-lg text-accent-primary uppercase tracking-widest leading-none">
          A
        </span>
      </div>
      <motion.p
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-xs font-semibold uppercase tracking-widest text-text-primary mb-1 select-none"
      >
        Loading Wardrobe
      </motion.p>
      <p className="text-[11px] text-text-muted select-none">Retrieving your purchase history...</p>
    </div>
  );
}
