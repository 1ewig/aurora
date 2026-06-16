"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { authClient } from "@/lib/auth-client";
import { normalizeProfile } from "@/utils/auth";

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
          const roleData = roleRes && roleRes.ok ? await roleRes.json() : { isAdmin: false };
          const profile = normalizeProfile({ displayName: user.name || "" });
          useAuthStore.setState({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: user.emailVerified,
              image: user.image,
              isAdmin: roleData.isAdmin,
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
