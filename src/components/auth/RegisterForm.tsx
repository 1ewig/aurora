import { motion } from "framer-motion";
import Link from "next/link";

interface RegisterFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  formError: string;
  successMsg: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegisterForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  formError,
  successMsg,
  onSubmit,
}: RegisterFormProps) {
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
            Create Profile
          </h1>
          <p className="text-text-secondary text-sm">
            Join Aurora for a curated wardrobe experience.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="register-name"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
            >
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
              placeholder="Jean Doe"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
            >
              Email Address
            </label>
            <input
              id="register-email"
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
              htmlFor="register-password"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          {formError && (
            <div className="text-xs text-error font-medium">
              {formError}
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
            Sign Up
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
