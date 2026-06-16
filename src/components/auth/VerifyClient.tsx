/**
 * Aurora — src/components/auth/VerifyClient.tsx
 *
 * Client component that handles email-verification flows. Reads the email and
 * token from query params, auto-verifies if a token is present, and supports
 * resending the verification email.
 */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { VerifyForm } from "./VerifyForm";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const { verifyEmail, resendVerification, loading, error: storeError, clearError } = useAuthStore();

  useEffect(() => { clearError(); }, [clearError]);

  useEffect(() => {
    if (!token && !email) {
      router.replace("/login");
    }
  }, [token, email, router]);

  useEffect(() => {
    if (token) {
      verifyEmail("", token).then(({ error }) => {
        if (error) {
          const msg = typeof error === "string" ? error : error.message || "Verification failed.";
          setFormError(msg);
        } else {
          setVerified(true);
          setSuccessMsg("Email verified successfully!");
          setTimeout(() => { router.push("/profile"); }, 2000);
        }
      });
    }
  }, [token, verifyEmail, router]);

  const handleResend = async () => {
    if (!email) {
      setFormError("No email address provided.");
      return;
    }
    setFormError("");
    setSuccessMsg("");
    const { error } = await resendVerification(email);
    if (error) {
      setFormError(typeof error === "string" ? error : error.message || "Failed to resend.");
      setResendCooldown(60);
    } else {
      setSuccessMsg("Verification email sent! Check your inbox.");
      setResendCooldown(60);
    }
  };

  const handleBack = () => { router.push("/login"); };

  if (!token && !email) return null;

  return (
    <VerifyForm
      email={email}
      formError={formError || storeError || ""}
      successMsg={successMsg}
      loading={loading}
      verified={verified}
      onResend={handleResend}
      onBack={handleBack}
      initialCooldown={resendCooldown}
    />
  );
}

/** Wraps VerifyContent in a Suspense boundary for useSearchParams support. */
export function VerifyClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <VerifyContent />
    </Suspense>
  );
}
