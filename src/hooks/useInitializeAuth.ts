/**
 * Aurora — src/hooks/useInitializeAuth.ts
 *
 * Initializes the auth store on mount by fetching the current session
 * and resolving admin role.
 */

"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { authClient } from "@/lib/auth-client";
import { fetchUserRole, buildUserState } from "@/utils/auth";

/** Fetches the current session and populates the auth store on mount. */
export function useInitializeAuth() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      useAuthStore.setState({ loading: true, error: null });
      try {
        const { data: sessionData } = await authClient.getSession();
        const user = sessionData?.user || null;

        if (user) {
          const role = await fetchUserRole();
          const state = buildUserState(user, role);
          useAuthStore.setState({ ...state, loading: false });
        } else {
          useAuthStore.setState({ user: null, profile: null, loading: false });
        }
      } catch {
        useAuthStore.setState({ user: null, profile: null, loading: false });
      }
    }

    init();
  }, []);
}
