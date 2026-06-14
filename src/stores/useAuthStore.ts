import { create } from 'zustand';
import { insforge } from '@/utils/insforge/client';
import { normalizeProfile } from '@/utils/auth';

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
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
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        let message = data.message || 'Invalid email or password.';
        let needsVerification = false;

        if (data.error === 'AUTH_EMAIL_NOT_CONFIRMED') {
          message = 'Please verify your email address before signing in.';
          needsVerification = true;
        } else {
          try {
            const checkRes = await fetch('/api/auth/check-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData && checkData.exists === false) {
                message = 'This email is not registered. Please create an account first.';
              } else if (checkData && checkData.exists === true && checkData.verified === false) {
                message = 'Your email address is not verified yet. Please verify it or click resend code.';
                needsVerification = true;
              } else {
                message = 'Incorrect password. Please try again.';
              }
            }
          } catch (e) {
            // Fallback to original message
          }
        }

        const updatedError = { ...data, message };
        set({ loading: false, error: message });
        return { error: updatedError, needsVerification };
      }

      const user = data?.user || null;
      if (user) {
        const { data: profileData } = await insforge.auth.getProfile(user.id);
        const profile = normalizeProfile(profileData);
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
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        let message = data.message || 'Failed to sign up.';
        if (data.error === 'AUTH_EMAIL_EXISTS' || message.toLowerCase().includes('exists')) {
          message = 'An account with this email already exists. Please sign in instead.';
        }
        const updatedError = { ...data, message };
        set({ loading: false, error: message });
        return { error: updatedError };
      }

      const user = data?.user || null;
      if (data?.requireEmailVerification) {
        set({ loading: false });
        return { error: null, needsVerification: true };
      }

      if (user) {
        set({ user, profile: { displayName: name || '' }, loading: false });
        return { error: null, needsVerification: false };
      }

      set({ loading: false });
      return { error: null, needsVerification: true };
    } catch (err: any) {
      const message = err.message || 'Failed to sign up.';
      set({ loading: false, error: message });
      return { error: { message } };
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch (e) {
      // Proceed with local cleanup even if server call fails
    }
    set({ user: null, profile: null, loading: false, error: null });
  },

  updateProfile: async (updatedFields) => {
    const currentProfile = get().profile;
    const newProfile = { ...currentProfile, ...updatedFields } as Profile;
    const { data, error } = await insforge.auth.setProfile({
      name: newProfile.displayName,
      displayName: newProfile.displayName,
    });
    if (error) {
      return { error };
    }
    const profile = normalizeProfile(data);
    set({ profile });
    return { error: null };
  },

  verifyEmail: async (email, otp, name) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ loading: false, error: data.message || 'Invalid verification code.' });
        return { error: data };
      }

      const user = data?.user || null;
      if (user) {
        const { data: profileData } = await insforge.auth.getProfile(user.id);
        const profile = normalizeProfile(profileData || { displayName: name || '' });
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
      return { error: null };
    } catch (err: any) {
      set({ loading: false, error: err.message || 'Verification failed.' });
      return { error: { message: err.message } };
    }
  },

  resendVerification: async (email) => {
    set({ loading: true, error: null });
    const { error } = await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      set({ loading: false, error: error.message || 'Failed to resend verification code.' });
      return { error };
    }
    set({ loading: false });
    return { error: null };
  },

  sendResetPasswordEmail: async (email) => {
    set({ loading: true, error: null });
    const { error } = await insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      set({ loading: false, error: error.message || 'Failed to send reset password email.' });
      return { error };
    }
    set({ loading: false });
    return { error: null };
  },

  exchangeResetPasswordToken: async (email, code) => {
    set({ loading: true, error: null });
    const { data, error } = await insforge.auth.exchangeResetPasswordToken({
      email,
      code,
    });
    if (error) {
      set({ loading: false, error: error.message || 'Failed to exchange reset password token.' });
      return { error };
    }
    set({ loading: false });
    return { token: data?.token, error: null };
  },

  resetPassword: async (newPassword, token) => {
    set({ loading: true, error: null });
    const { error } = await insforge.auth.resetPassword({
      newPassword,
      otp: token,
    });
    if (error) {
      set({ loading: false, error: error.message || 'Failed to reset password.' });
      return { error };
    }
    set({ loading: false });
    return { error: null };
  },
}));
