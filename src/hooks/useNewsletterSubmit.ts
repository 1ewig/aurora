/**
 * Aurora — src/hooks/useNewsletterSubmit.ts
 *
 * Newsletter sign-up form state — email input, submission, and loading state.
 * Currently uses a simulated async submission (1s delay).
 */

import { useState } from "react";

/** Newsletter sign-up form state and submission handler. */
export function useNewsletterSubmit() {
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

  return { email, setEmail, submitted, loading, handleSubmit };
}
