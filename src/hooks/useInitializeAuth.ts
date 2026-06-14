"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { insforge } from "@/utils/insforge/client";
import { normalizeProfile } from "@/utils/auth";

export function useInitializeAuth() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      useAuthStore.setState({ loading: true, error: null });
      try {
        const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
        if (userError) {
          useAuthStore.setState({ user: null, profile: null, loading: false });
          return;
        }

        const user = userData?.user || null;
        if (user) {
          const { data: profileData } = await insforge.auth.getProfile(user.id);
          const profile = normalizeProfile(profileData);
          useAuthStore.setState({ user, profile, loading: false });
        } else {
          useAuthStore.setState({ user: null, profile: null, loading: false });
        }
      } catch (e: any) {
        useAuthStore.setState({
          error: e.message || "Initialization failed",
          loading: false,
        });
      }
    }

    init();
  }, []);
}
