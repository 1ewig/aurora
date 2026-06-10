"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { user, signIn, loading, error: storeError } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setFormError(error.message || "Invalid email or password.");
    } else {
      router.push("/profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-[90vh] md:min-h-screen bg-bg-primary pt-24 pb-12 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-lg shadow-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl uppercase tracking-wider mb-2">
            Access Profile
          </h1>
          <p className="text-text-secondary text-sm">
            Sign in with your email and password to access your wardrobe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          {(formError || storeError) && (
            <div className="text-xs text-error font-medium">
              {formError || storeError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-bg-ink hover:bg-accent-primary text-white hover:text-bg-ink font-semibold rounded uppercase tracking-wider text-sm transition-all duration-300 shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="text-sm text-text-secondary">
            New to Aurora?{" "}
            <Link
              href="/register"
              className="text-accent-primary font-semibold hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
