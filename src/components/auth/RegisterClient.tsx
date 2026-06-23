/**
 * Aurora — src/components/auth/RegisterClient.tsx
 *
 * Client component that manages the user registration flow. Collects name, email,
 * and password, calls the auth store to sign up, and shows a verification-prompt
 * screen when email confirmation is required.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { RegisterForm } from "./RegisterForm";

/** Client-side registration orchestrator with form state, validation, and auth-store integration. */
export function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      const { error, needsVerification: reqVerification } = await signUp(email, password, name);
      if (error) {
        setFormError(typeof error === "string" ? error : error.message || "Failed to sign up.");
      } else if (reqVerification) {
        setShowEmailSent(true);
        setSuccessMsg("Account created! Check your email for a verification link.");
      } else {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (showEmailSent) {
    return (
      <main className="min-h-[90vh] md:min-h-screen bg-bg-primary pt-12 pb-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-[440px] mb-4">
          <button onClick={() => setShowEmailSent(false)} type="button"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
        </div>
        <div className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-[24px] shadow-sm text-center">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider mb-2">Check Your Email</h1>
          <p className="text-text-secondary text-sm">
            We sent a verification link to<br />
            <span className="font-medium text-text-primary break-all">{email}</span>.
          </p>
          <p className="text-text-secondary text-xs mt-3">
            Click the link to verify your account and sign in.
          </p>
          <div className="mt-6">
            <button onClick={() => router.push("/login")} type="button"
              className="text-accent-primary font-semibold text-sm hover:underline cursor-pointer">
              Go to Sign In
            </button>
          </div>
        </div>
      </main>
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
      submitting={submitting}
    />
  );
}
