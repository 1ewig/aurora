/**
 * Aurora — src/components/landing/ServicePromise.tsx
 *
 * Trust signals and services promise section showing customer security, return rules, and packaging style.
 */

"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/animations/variants";

interface PromiseItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const promises: PromiseItem[] = [
  {
    title: "Complimentary Returns",
    description: "14-day return window with pre-paid shipping labels.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
  },
  {
    title: "Secure Checkout",
    description: "Fully encrypted transaction flow safeguarding payment details.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Atelier Packaging",
    description: "Each garment arrives inside signature linen protection dust covers.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: "Dedicated Support",
    description: "Direct email and chat line to our custom tailoring studio team.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A9.75 9.75 0 0112 2.25h.75A9.75 9.75 0 0122.5 12v.75A9.75 9.75 0 0112.75 22.5H12A9.75 9.75 0 012.25 12.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v-3.75m-3 0h6" />
      </svg>
    ),
  },
];

export function ServicePromise() {
  return (
    <section
      id="service-promise"
      aria-label="Service promise"
      className="py-16 bg-bg-secondary border-t border-b border-border-subtle"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {promises.map((promise, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="flex items-start gap-4"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-border-subtle flex items-center justify-center text-accent-primary">
                {promise.icon}
              </div>
              
              {/* Text */}
              <div>
                <h4 className="font-sans font-black text-sm text-text-primary mb-1">
                  {promise.title}
                </h4>
                <p className="text-text-secondary text-xs font-light leading-relaxed">
                  {promise.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
