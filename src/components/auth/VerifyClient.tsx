"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { VerifyForm } from "./VerifyForm";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "";

  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [initialSent, setInitialSent] = useState(false);

  const {
    verifyEmail,
    resendVerification,
    loading,
    error: storeError,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  // If email is missing, redirect to login
  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  // If redirected from login, send a verification code automatically on mount
  useEffect(() => {
    if (email && type === "login" && !initialSent) {
      setInitialSent(true);
      setSuccessMsg("Your email is not verified yet. Sending verification code...");
      resendVerification(email)
        .then(({ error }) => {
          if (error) {
            setFormError(error.message || "Failed to send verification code.");
            setSuccessMsg("");
          } else {
            setSuccessMsg("Verification code has been sent to your email.");
          }
        })
        .catch(() => {
          setFormError("Failed to send verification code.");
          setSuccessMsg("");
        });
    } else if (email && type === "signup" && !initialSent) {
      setInitialSent(true);
      setSuccessMsg("Verification code sent to your email. Please enter it below.");
    }
  }, [email, type, initialSent, resendVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (otp.length !== 6) {
      setFormError("Please enter a 6-digit code.");
      return;
    }

    const { error } = await verifyEmail(email, otp);
    if (error) {
      setFormError(error.message || "Invalid verification code.");
    } else {
      setSuccessMsg("Email verified successfully! Redirecting...");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
  };

  const handleResend = async () => {
    setFormError("");
    setSuccessMsg("");
    const { error } = await resendVerification(email);
    if (error) {
      setFormError(error.message || "Failed to resend verification code.");
      throw error;
    } else {
      setSuccessMsg("Verification code resent to your email.");
    }
  };

  const handleBack = () => {
    router.push("/login");
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <VerifyForm
      email={email}
      otp={otp}
      setOtp={setOtp}
      formError={formError || storeError || ""}
      successMsg={successMsg}
      loading={loading}
      onSubmit={handleSubmit}
      onResend={handleResend}
      onBack={handleBack}
    />
  );
}

export function VerifyClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
