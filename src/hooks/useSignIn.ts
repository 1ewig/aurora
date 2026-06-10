"use client";

import { useAuthStore } from "@/stores/useAuthStore";

export function useSignIn() {
  const storeSignIn = useAuthStore((s) => s.signIn);
  const setState = useAuthStore.setState;

  return async (email: string, password: string) => {
    const { error } = await storeSignIn(email, password);
    if (error) {
      let message = error.message || "Invalid email or password.";
      try {
        const checkRes = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData && checkData.exists === false) {
            message = "This email is not registered. Please create an account first.";
          } else {
            message = "Incorrect password. Please try again.";
          }
        }
      } catch (e) {
        // Fallback to original error message
      }
      const updatedError = { ...error, message };
      setState({ error: message });
      return { error: updatedError };
    }
    return { error: null };
  };
}
