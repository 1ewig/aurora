"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSignIn } from "@/hooks/useSignIn";
import { LoginForm } from "./LoginForm";
import { VerifyForm } from "./VerifyForm";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");

  const {
    user,
    loading,
    error: storeError,
    clearError,
    verifyEmail,
    resendVerification,
  } = useAuthStore();
  const signIn = useSignIn();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("insforge_status");
    const type = params.get("insforge_type");
    const errorMsg = params.get("insforge_error");

    if (type === "verify_email") {
      if (status === "success") {
        setSuccessMsg("Your email has been verified successfully! Please log in.");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === "error") {
        setFormError(errorMsg || "Email verification failed. The link may have expired or is invalid.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (user && !loading && !needsVerification) {
      router.push("/profile");
    }
  }, [user, loading, router, needsVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    const { error, needsVerification: reqVerification } = await signIn(email, password);
    if (error) {
      if (reqVerification) {
        await resendVerification(email);
        setNeedsVerification(true);
        setSuccessMsg("Your email is not verified yet. A new verification code has been sent.");
      } else {
        setFormError(error.message || "Invalid email or password.");
      }
    } else {
      router.push("/profile");
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
    <LoginForm
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
