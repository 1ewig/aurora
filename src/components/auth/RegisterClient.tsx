"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { RegisterForm } from "./RegisterForm";

export function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    user,
    signUp,
    loading,
    error: storeError,
    clearError,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

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
      router.push(`/verify?email=${encodeURIComponent(email)}&type=signup`);
    } else {
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
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
