/**
 * Aurora — src/stores/useAuthStore.ts
 *
 * Zustand store for authentication state and operations.
 * Wraps Better Auth client methods with error mapping and profile normalization.
 */

import { create } from 'zustand';
import { authClient } from '@/lib/auth-client';
import { fetchUserRole, buildUserState } from '@/utils/auth';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  isAdmin?: boolean | null;
  role?: string | null;
}

export interface Profile {
  displayName: string;
}

/** Maps Better Auth error codes/statuses to human-readable messages. */
function mapBetterAuthError(error: any): string {
  if (!error) return "Something went wrong.";
  const msg = (error.message || "").toLowerCase();
  const status = error.status;
  const code = (error.code || "").toLowerCase();

  if (status === 403 || code === "email_not_verified") return "Please verify your email before signing in.";
  if (code === "user_not_found") return "No account found with this email address.";
  if (code === "invalid_password") return "Incorrect password. Try again or reset your password.";
  if (code === "invalid_token" || msg.includes("invalid token")) return "This link is invalid or has expired.";
  if (code === "invalid_email" || msg.includes("invalid email")) return "This email address is not valid.";
  if (code === "weak_password" || msg.includes("password is too short")) return "Password must be at least 8 characters.";
  if (code === "rate_limit" || msg.includes("rate limit") || msg.includes("too many requests")) return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("already") && (msg.includes("exist") || msg.includes("registered") || msg.includes("taken"))) return "An account with this email already exists.";
  if (msg.includes("account") && msg.includes("not found")) return "No account found with this email address.";
  if (msg.includes("reset") && msg.includes("password") && msg.includes("expired")) return "This password reset link has expired. Please request a new one.";

  return error.message || "Something went wrong.";
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: any }>;
  verifyEmail: (email: string, token: string) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  sendResetPasswordEmail: (email: string) => Promise<{ error: any }>;
  resetPassword: (newPassword: string, token: string) => Promise<{ error: any }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
  clearError: () => void;
}

/** Global auth store wrapping Better Auth with error handling and profile management. */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) {
        const message = mapBetterAuthError(error);
        const isUnverified = error.status === 403 || (error.message || "").toLowerCase().includes("verify");
        set({ loading: false, error: message });
        return { error, needsVerification: isUnverified };
      }

      if (data?.user) {
        const role = await fetchUserRole();
        const state = buildUserState(data.user, role);
        set({ ...state, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
      return { error: null, needsVerification: false };
    } catch (err: any) {
      const message = err.message || "Failed to sign in.";
      set({ loading: false, error: message });
      return { error: { message }, needsVerification: false };
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await authClient.signUp.email({ email, password, name: name || "" });
      if (error) {
        const message = mapBetterAuthError(error);
        set({ loading: false, error: message });
        return { error: message, needsVerification: false };
      }

      if (data?.user && data.user.emailVerified) {
        const role = await fetchUserRole();
        const state = buildUserState(data.user, role);
        set({ ...state, loading: false });
        return { error: null, needsVerification: false };
      }

      set({ loading: false });
      return { error: null, needsVerification: true };
    } catch (err: any) {
      const message = mapBetterAuthError(err);
      set({ loading: false, error: message });
      return { error: message, needsVerification: false };
    }
  },

  signOut: async () => {
    try {
      await authClient.signOut();
    } catch {
      // proceed with local cleanup
    }
    set({ user: null, profile: null, error: null });
  },

  updateProfile: async (updatedFields) => {
    try {
      const currentProfile = get().profile;
      const displayName = updatedFields.displayName || currentProfile?.displayName || '';
      const res = await authClient.updateUser({ name: displayName });
      if (res.error) {
        return { error: res.error };
      }
      set({ profile: { displayName } });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message });
      return { error: err };
    }
  },

  verifyEmail: async (_email, token) => {
    if (!token) {
      set({ error: "No verification token provided.", loading: false });
      return { error: { message: "No verification token provided." } };
    }
    set({ loading: true, error: null });
    try {
      const { error } = await authClient.verifyEmail({ query: { token } });
      if (error) {
        const message = mapBetterAuthError(error);
        set({ loading: false, error: message });
        return { error: message };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      const message = mapBetterAuthError(err);
      set({ loading: false, error: message });
      return { error: { message } };
    }
  },

  resendVerification: async (email) => {
    set({ loading: true, error: null });
    try {
      const callbackURL = `${window.location.origin}/profile`;
      const { error } = await authClient.sendVerificationEmail({ email, callbackURL });
      if (error) {
        const message = mapBetterAuthError(error);
        set({ loading: false, error: message });
        return { error };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },

  sendResetPasswordEmail: async (email) => {
    set({ loading: true, error: null });
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await authClient.requestPasswordReset({ email, redirectTo });
      if (error) {
        const message = mapBetterAuthError(error);
        set({ loading: false, error: message });
        return { error: message };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },

  resetPassword: async (newPassword, token) => {
    set({ loading: true, error: null });
    try {
      const { error } = await authClient.resetPassword({ newPassword, token });
      if (error) {
        const message = mapBetterAuthError(error);
        set({ loading: false, error: message });
        return { error: message };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const { error } = await authClient.changePassword({ currentPassword, newPassword });
      if (error) {
        const message = mapBetterAuthError(error);
        set({ loading: false, error: message });
        return { error: message };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },
}));
