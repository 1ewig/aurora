"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { staggerContainer, fadeInUp } from "@/animations/variants";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="py-32 px-6 md:px-20 bg-[#0D0D0D]"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
        >
          <motion.div variants={fadeInUp}>
            <EyebrowLabel color="gold">Join The Inner Circle</EyebrowLabel>
          </motion.div>

          <motion.h2
            id="newsletter-heading"
            variants={fadeInUp}
            className="font-sans font-black leading-tight tracking-[-0.02em] text-[#F7F7F5] mt-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
          >
            First to Know.
            <br />
            Last to Forget.
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-[#ABABAB] mt-6 leading-relaxed max-w-md mx-auto"
          >
            Early collection access, private sale invitations, and unfiltered
            notes from the studio.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-12">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-[#C8A882] flex items-center justify-center mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  <p className="text-[#F7F7F5] font-medium text-lg">
                    Welcome to the inner circle.
                  </p>
                  <p className="text-[#ABABAB] text-sm">
                    You'll hear from us soon.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                  aria-label="Newsletter subscription form"
                  noValidate
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    aria-required="true"
                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-[#F7F7F5] placeholder:text-white/40 focus:outline-none focus:border-[#C8A882] transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 rounded-full bg-[#C8A882] text-white font-medium hover:bg-[#B8860B] transition-colors text-sm disabled:opacity-70 whitespace-nowrap"
                  >
                    {loading ? "..." : "Subscribe →"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-[#ABABAB] text-xs mt-4"
          >
            Fewer than 4 emails per month. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
