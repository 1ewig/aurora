import { create } from 'zustand';
import { insforge } from '@/utils/insforge';
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
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) {
      let message = error.message || 'Invalid email or password.';
      let needsVerification = false;
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
          } else if (checkData && checkData.exists === true && checkData.verified === false) {
            message = "Your email address is not verified yet. Please verify it or click resend code.";
            needsVerification = true;
          } else {
            message = "Incorrect password. Please try again.";
          }
        }
      } catch (e) {
        // Fallback to original message
      }
      const updatedError = { ...error, message };
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
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      redirectTo: `${window.location.origin}/login`
    });
    if (error) {
      let message = error.message || 'Failed to sign up.';
      if (error.error === 'AUTH_EMAIL_EXISTS' || message.toLowerCase().includes('exists')) {
        message = 'An account with this email already exists. Please sign in instead.';
      }
      const updatedError = { ...error, message };
      set({ loading: false, error: message });
      return { error: updatedError };
    }
    const user = data?.user || null;
    const accessToken = data?.accessToken || null;

    if (accessToken && user) {
      // Auto-login (email verification disabled)
      set({ user, profile: { displayName: name || '' }, loading: false });
      return { error: null, needsVerification: false };
    } else {
      // Email verification is required
      set({ loading: false });
      return { error: null, needsVerification: true };
    }
  },

  signOut: async () => {
    set({ loading: true });
    await insforge.auth.signOut();
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
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) {
      set({ loading: false, error: error.message || 'Invalid verification code.' });
      return { error };
    }
    const user = data?.user || null;
    if (user) {
      // Create user profile if it doesn't exist or is not fetched
      const { data: profileData } = await insforge.auth.getProfile(user.id);
      const profile = normalizeProfile(profileData || { displayName: name || '' });
      set({ user, profile, loading: false });
    } else {
      set({ user: null, profile: null, loading: false });
    }
    return { error: null };
  },

  resendVerification: async (email) => {
    set({ loading: true, error: null });
    const { error } = await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: `${window.location.origin}/login`
    });
    if (error) {
      set({ loading: false, error: error.message || 'Failed to resend verification code.' });
      return { error };
    }
    set({ loading: false });
    return { error: null };
  }
}));
