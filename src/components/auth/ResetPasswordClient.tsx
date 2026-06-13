"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ResetPasswordForm } from "./ResetPasswordForm";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const status = searchParams.get("insforge_status") || "";
  const type = searchParams.get("insforge_type") || "";
  const errorMsg = searchParams.get("insforge_error") || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    exchangeResetPasswordToken,
    resetPassword,
    loading,
    error: storeError,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Check URL parameters for status/error indicators from email link redirect
  useEffect(() => {
    if (type === "reset_password") {
      if (status === "error") {
        setFormError(errorMsg || "The password reset link is invalid or has expired.");
      } else if (status === "ready" && token) {
        setSuccessMsg("Reset link verified! Please enter your new password below.");
      }
    }
  }, [type, status, token, errorMsg]);

  // If email is missing, redirect to login
  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    let activeToken = token;

    // If no token from the URL, exchange the manual 6-digit code for a token first
    if (!activeToken) {
      if (code.length !== 6) {
        setFormError("Please enter a 6-digit verification code.");
        return;
      }
      const { token: exchangedToken, error: exchangeError } = await exchangeResetPasswordToken(email, code);
      if (exchangeError || !exchangedToken) {
        setFormError(exchangeError?.message || "Invalid or expired verification code.");
        return;
      }
      activeToken = exchangedToken;
    }

    // Call resetPassword with the token
    const { error: resetError } = await resetPassword(newPassword, activeToken);
    if (resetError) {
      setFormError(resetError.message || "Failed to update your password.");
    } else {
      setSuccessMsg("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasToken = !!(status === "ready" && token);

  return (
    <ResetPasswordForm
      email={email}
      code={code}
      setCode={setCode}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      formError={formError || storeError || ""}
      successMsg={successMsg}
      loading={loading}
      onSubmit={handleSubmit}
      hasToken={hasToken}
      onBackToLogin={handleBackToLogin}
    />
  );
}

export function ResetPasswordClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
