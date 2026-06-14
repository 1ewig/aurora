"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface VerifyFormProps {
  email: string;
  otp: string;
  setOtp: (val: string) => void;
  formError: string;
  successMsg: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => Promise<void>;
  onBack: () => void;
  initialCooldown?: number;
}

function maskEmail(rawEmail: string) {
  const [name, domain] = rawEmail.split("@");
  if (!domain) return rawEmail;
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

export function VerifyForm({
  email,
  otp,
  setOtp,
  formError,
  successMsg,
  loading,
  onSubmit,
  onResend,
  onBack,
  initialCooldown = 0,
}: VerifyFormProps) {
  const [countdown, setCountdown] = useState(initialCooldown);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (initialCooldown > 0) {
      setCountdown(initialCooldown);
    }
  }, [initialCooldown]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  function parseCooldownSeconds(err: unknown): number {
    if (err && typeof err === "object" && "message" in err) {
      const msg = (err as { message: string }).message;
      const match = msg.match(/(\d+)\s*seconds?/i);
      if (match) return parseInt(match[1], 10);
    }
    return 60;
  }

  const handleResendClick = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setCountdown(60);
    } catch (err) {
      setCountdown(parseCooldownSeconds(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-[90vh] md:min-h-screen bg-bg-primary pt-12 pb-12 px-6 flex flex-col items-center justify-center">
      {/* Back button */}
      <div className="w-full max-w-[440px] mb-4">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Sign In
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-[24px] shadow-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl uppercase tracking-wider mb-2">
            Verify Email
          </h1>
          <p className="text-text-secondary text-sm">
            We sent a 6-digit verification code to<br />
            <span className="font-medium text-text-primary break-all">{maskEmail(email)}</span>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="verify-otp"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-1 text-center"
            >
              Verification Code
            </label>
            <input
              id="verify-otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, ""); // allow alphanumeric values safely
                if (val.length <= 6) setOtp(val);
              }}
              className="w-full px-5 py-4 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none transition-colors text-lg text-center font-mono tracking-[0.4em] placeholder:tracking-normal"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>

          {formError && (
            <div className="text-xs text-error font-medium px-1 text-center">
              {formError}
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-success font-medium px-1 text-center">
              {successMsg}
            </div>
          )}

          <Button type="submit" variant="filled" fullWidth size="md" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="text-sm text-text-secondary">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendClick}
              disabled={countdown > 0 || resending || loading}
              className={`font-semibold text-accent-primary transition-colors hover:underline ${
                countdown > 0 || resending || loading ? "opacity-55 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {countdown > 0 ? `Resend Code (${countdown}s)` : resending ? "Sending..." : "Resend Code"}
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
