"use client";

import { useAuthStore } from "@/stores/useAuthStore";

export function useSignIn() {
  const storeSignIn = useAuthStore((s) => s.signIn);

  return async (email: string, password: string) => {
    return await storeSignIn(email, password);
  };
}
