"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { RegisterForm } from "./RegisterForm";
import { VerifyForm } from "./VerifyForm";

export function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");

  const {
    user,
    signUp,
    verifyEmail,
    resendVerification,
    loading,
    error: storeError,
    clearError,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user && !loading && !needsVerification) {
      router.push("/profile");
    }
  }, [user, loading, router, needsVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!name) {
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

    try {
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData && checkData.exists && !checkData.verified) {
          setFormError("This email is registered but not verified yet. Please sign in to verify your account.");
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    const { error, needsVerification: reqVerification } = await signUp(email, password, name);
    if (error) {
      setFormError(error.message || "Failed to sign up.");
    } else if (reqVerification) {
      setNeedsVerification(true);
      setSuccessMsg("Verification code sent to your email. Please enter it below.");
    } else {
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (otp.length !== 6) {
      setFormError("Please enter a 6-digit code.");
      return;
    }

    const { error } = await verifyEmail(email, otp, name);
    if (error) {
      setFormError(error.message || "Invalid verification code.");
    } else {
      setSuccessMsg("Email verified successfully! Redirecting...");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
  };

  const handleResendVerify = async () => {
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

  if (loading && !needsVerification && !successMsg) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (needsVerification) {
    return (
      <VerifyForm
        email={email}
        otp={otp}
        setOtp={setOtp}
        formError={formError || storeError || ""}
        successMsg={successMsg}
        loading={loading}
        onSubmit={handleVerifySubmit}
        onResend={handleResendVerify}
        onBack={() => {
          setNeedsVerification(false);
          setOtp("");
          setFormError("");
          setSuccessMsg("");
        }}
      />
    );
  }

  return (
    <RegisterForm
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      formError={formError || storeError || ""}
      successMsg={successMsg}
      onSubmit={handleSubmit}
    />
  );
}
