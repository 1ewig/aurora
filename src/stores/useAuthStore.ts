import { create } from 'zustand';
import { insforge } from '@/utils/insforge';

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

export interface Profile {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: any }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
      if (userError) {
        set({ user: null, profile: null, loading: false });
        return;
      }
      
      const user = userData?.user || null;
      if (user) {
        const { data: profileData } = await insforge.auth.getProfile(user.id);
        const profileDataAny = profileData as any;
        const profile: Profile = {
          displayName: profileDataAny?.displayName || profileDataAny?.profile?.displayName || '',
          bio: profileDataAny?.bio || profileDataAny?.profile?.bio || '',
          avatarUrl: profileDataAny?.avatarUrl || profileDataAny?.profile?.avatarUrl || '',
        };
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (e: any) {
      set({ error: e.message || 'Initialization failed', loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }
    const user = data?.user || null;
    if (user) {
      const { data: profileData } = await insforge.auth.getProfile(user.id);
      const profileDataAny = profileData as any;
      const profile: Profile = {
        displayName: profileDataAny?.displayName || profileDataAny?.profile?.displayName || '',
        bio: profileDataAny?.bio || profileDataAny?.profile?.bio || '',
        avatarUrl: profileDataAny?.avatarUrl || profileDataAny?.profile?.avatarUrl || '',
      };
      set({ user, profile, loading: false });
    } else {
      set({ user: null, profile: null, loading: false });
    }
    return { error: null };
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      redirectTo: `${window.location.origin}/profile`
    });
    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }
    const user = data?.user || null;
    set({ user, profile: { displayName: '', bio: '', avatarUrl: '' }, loading: false });
    return { error: null };
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
      displayName: newProfile.displayName,
      bio: newProfile.bio,
      avatarUrl: newProfile.avatarUrl,
    });
    if (error) {
      return { error };
    }
    const dataAny = data as any;
    set({
      profile: {
        displayName: dataAny?.displayName || dataAny?.profile?.displayName || '',
        bio: dataAny?.bio || dataAny?.profile?.bio || '',
        avatarUrl: dataAny?.avatarUrl || dataAny?.profile?.avatarUrl || '',
      }
    });
    return { error: null };
  }
}));
