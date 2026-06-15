"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSignIn } from "@/hooks/useSignIn";
import { LoginForm } from "./LoginForm";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showResetOption, setShowResetOption] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const {
    user,
    loading,
    error: storeError,
    clearError,
    sendResetPasswordEmail,
  } = useAuthStore();
  const signIn = useSignIn();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    setShowResetOption(false);
  }, [email, password]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const status = params.get("status");

    if (token && status === "success") {
      setSuccessMsg("Your email has been verified successfully! Please log in.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setShowResetOption(false);

    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    const { error, needsVerification: reqVerification, needsReset } = await signIn(email, password);
    if (error) {
      if (reqVerification) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        const errorMsg = typeof error === "string" ? error : error.message || "Invalid email or password.";
        setFormError(errorMsg);
        if (needsReset) {
          setShowResetOption(true);
        }
      }
    } else {
      router.push("/profile");
    }
  };

  const handleResetClick = async () => {
    if (!email) {
      setFormError("Please enter your email address first.");
      return;
    }
    setResetLoading(true);
    setFormError("");
    setSuccessMsg("");
    try {
      const { error } = await sendResetPasswordEmail(email);
      if (error) {
        const msg = typeof error === "string" ? error : error.message || "Failed to send reset email.";
        setFormError(msg);
      } else {
        setSuccessMsg("If an account exists with this email, a password reset link has been sent. Check your inbox.");
      }
    } catch {
      setFormError("Failed to initiate password reset.");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading && !successMsg && !resetLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      formError={formError || storeError || ""}
      successMsg={successMsg}
      onSubmit={handleSubmit}
      showResetOption={showResetOption}
      onResetClick={handleResetClick}
      resetLoading={resetLoading}
    />
  );
}
