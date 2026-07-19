/**
 * Aurora — src/components/auth/LoginForm.tsx
 *
 * Presentational form for signing in with email and password. Includes show/hide
 * password toggle, forgot-password action, and links to registration.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  formError: string;
  successMsg?: string;
  onSubmit: (e: React.FormEvent) => void;
  onResetClick?: () => void;
  resetLoading?: boolean;
  submitting?: boolean;
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

/** Login form UI — email, password, validation messages, and submit/reset actions. */
export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  formError,
  successMsg,
  onSubmit,
  onResetClick,
  resetLoading,
  submitting,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-[90vh] md:min-h-screen bg-bg-primary pt-12 pb-12 px-6 flex flex-col items-center justify-center">
      {/* Back to Home Link */}
      <div className="w-full max-w-[440px] mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-[24px] shadow-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl uppercase tracking-wider mb-2">
            Access Profile
          </h1>
          <p className="text-text-secondary text-sm">
            Sign in with your email and password to access your wardrobe.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-1"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none transition-colors text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-5 pr-12 py-3.5 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none transition-colors text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none p-1 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="flex justify-end px-1 mt-1.5">
              <button
                type="button"
                onClick={onResetClick}
                disabled={resetLoading}
                className="text-xs text-accent-primary font-semibold hover:underline cursor-pointer disabled:opacity-55"
              >
                {resetLoading ? "Sending..." : "Forgot Password?"}
              </button>
            </div>
          </div>

          {formError && (
            <div className="text-xs text-error font-medium text-center px-1">
              {formError}
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-success font-medium text-center px-1">
              {successMsg}
            </div>
          )}

          <Button type="submit" variant="filled" fullWidth size="md" disabled={submitting}>
            {submitting ? (
              <>
                Signing In
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              "Sign In"
            )}
          </Button>
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
