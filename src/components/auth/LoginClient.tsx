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

  const {
    user,
    loading,
    error: storeError,
    clearError,
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
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

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
        router.push(`/verify?email=${encodeURIComponent(email)}&type=login`);
      } else {
        setFormError(error.message || "Invalid email or password.");
      }
    } else {
      router.push("/profile");
    }
  };

  if (loading && !successMsg) {
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
    />
  );
}
