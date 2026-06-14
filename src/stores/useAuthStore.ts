import { create } from 'zustand';
import { authClient } from '@/lib/auth-client';
import { normalizeProfile } from '@/utils/auth';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
}

export interface Profile {
  displayName: string;
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
  verifyEmail: (email: string, otp: string, name?: string) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  sendResetPasswordEmail: (email: string) => Promise<{ error: any }>;
  exchangeResetPasswordToken: (email: string, code: string) => Promise<{ token?: string; error: any }>;
  resetPassword: (newPassword: string, token: string) => Promise<{ error: any }>;
  clearError: () => void;
}

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
        const message = error.message || 'Invalid email or password.';
        set({ loading: false, error: message });
        return { error, needsVerification: message.toLowerCase().includes('verify') };
      }

      const user = data?.user
        ? { id: data.user.id, email: data.user.email, name: data.user.name, emailVerified: data.user.emailVerified, image: data.user.image }
        : null;

      if (user) {
        const profile = normalizeProfile({ displayName: user.name || '' });
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
      return { error: null, needsVerification: false };
    } catch (err: any) {
      const message = err.message || 'Failed to sign in.';
      set({ loading: false, error: message });
      return { error: { message }, needsVerification: false };
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await authClient.signUp.email({ email, password, name: name || '' });
      if (error) {
        let message = error.message || 'Failed to sign up.';
        set({ loading: false, error: message });
        return { error };
      }

      const needsVerification = !data?.user?.emailVerified;

      if (data?.user) {
        set({
          user: { id: data.user.id, email: data.user.email, name: data.user.name, emailVerified: data.user.emailVerified, image: data.user.image },
          profile: { displayName: name || '' },
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      return { error: null, needsVerification };
    } catch (err: any) {
      const message = err.message || 'Failed to sign up.';
      set({ loading: false, error: message });
      return { error: { message } };
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await authClient.signOut();
    } catch {
      // proceed with local cleanup
    }
    set({ user: null, profile: null, loading: false, error: null });
  },

  updateProfile: async (updatedFields) => {
    set({ loading: true });
    try {
      const currentProfile = get().profile;
      const displayName = updatedFields.displayName || currentProfile?.displayName || '';
      const res = await authClient.updateUser({ name: displayName });
      if (res.error) {
        set({ loading: false });
        return { error: res.error };
      }
      set({ profile: { displayName }, loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },

  verifyEmail: async (email, _otp, _name) => {
    set({ loading: true, error: null });
    try {
      const callbackURL = `${window.location.origin}/profile`;
      const { error } = await authClient.sendVerificationEmail({ email, callbackURL });
      if (error) {
        set({ loading: false, error: error.message || 'Failed to send verification email.' });
        return { error };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message || 'Verification failed.' });
      return { error: { message: err.message } };
    }
  },

  resendVerification: async (email) => {
    set({ loading: true, error: null });
    try {
      const callbackURL = `${window.location.origin}/profile`;
      const { error } = await authClient.sendVerificationEmail({ email, callbackURL });
      if (error) {
        set({ loading: false, error: error.message || 'Failed to resend verification email.' });
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
        set({ loading: false, error: error.message || 'Failed to send reset password email.' });
        return { error };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },

  exchangeResetPasswordToken: async (_email, code) => {
    set({ loading: true, error: null });
    try {
      const { error } = await authClient.resetPassword({ newPassword: code });
      if (error) {
        set({ loading: false, error: error.message || 'Failed to exchange reset password token.' });
        return { error };
      }
      set({ loading: false });
      return { token: code, error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },

  resetPassword: async (newPassword, token) => {
    set({ loading: true, error: null });
    try {
      const { error } = await authClient.resetPassword({ newPassword, ...(token ? { token } : {}) });
      if (error) {
        set({ loading: false, error: error.message || 'Failed to reset password.' });
        return { error };
      }
      set({ loading: false });
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { error: err };
    }
  },
}));
