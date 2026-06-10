"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { user, signIn, signUp, loading, error: storeError } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (isSignUp && !name) {
      setFormError("Please enter your name.");
      return;
    }

    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) {
        setFormError(error.message || "Failed to sign up.");
      } else {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setFormError(error.message || "Invalid email or password.");
      } else {
        router.push("/profile");
      }
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
      <div className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl uppercase tracking-wider mb-2">
            {isSignUp ? "Create Profile" : "Access Profile"}
          </h1>
          <p className="text-text-secondary text-sm">
            {isSignUp
              ? "Join Aurora for a curated wardrobe experience."
              : "Sign in with your email and password."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
                    placeholder="Jean Doe"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
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
                  htmlFor="auth-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
                >
                  Password
                </label>
                <input
                  id="auth-password"
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

              {successMsg && (
                <div className="text-xs text-success font-medium">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-bg-ink hover:bg-accent-primary text-white hover:text-bg-ink font-semibold rounded uppercase tracking-wider text-sm transition-all duration-300 shadow-sm"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="text-sm text-text-secondary">
            {isSignUp ? "Already have an account?" : "New to Aurora?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setName("");
                setFormError("");
                setSuccessMsg("");
              }}
              className="text-accent-primary font-semibold hover:underline"
            >
              {isSignUp ? "Sign In" : "Register Now"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
