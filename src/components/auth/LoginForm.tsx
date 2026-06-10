import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  formError,
  onSubmit,
}: LoginFormProps) {
  return (
    <main className="min-h-[90vh] md:min-h-screen bg-bg-primary pt-24 pb-12 px-6 flex items-center justify-center">
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
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          {formError && (
            <div className="text-xs text-error font-medium px-1">
              {formError}
            </div>
          )}

          <Button type="submit" variant="filled" fullWidth size="md">
            Sign In
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
