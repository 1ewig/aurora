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

  const { user, loading, error: storeError, clearError } = useAuthStore();
  const signIn = useSignIn();
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

    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setFormError(error.message || "Invalid email or password.");
    } else {
      router.push("/profile");
    }
  };

  if (loading) {
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
      onSubmit={handleSubmit}
    />
  );
}
