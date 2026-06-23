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
import { normalizeProfile } from "@/utils/auth";

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
          const roleRes = await fetch("/api/auth/role").catch(() => null);
          const roleData = roleRes && roleRes.ok ? await roleRes.json() : { isAdmin: false, role: 'user' };
          const profile = normalizeProfile({ displayName: user.name || "" });
          useAuthStore.setState({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: user.emailVerified,
              image: user.image,
              isAdmin: roleData.isAdmin,
              role: roleData.role,
            },
            profile,
            loading: false,
          });
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
