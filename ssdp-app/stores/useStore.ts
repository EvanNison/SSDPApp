import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/auth';

interface AppState {
  // Auth
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isGuest: boolean;

  // Computed
  role: UserRole;
  isAuthenticated: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  session: null,
  profile: null,
  isLoading: true,
  isGuest: false,

  // Computed getters
  get role(): UserRole {
    const { profile, isGuest } = get();
    if (isGuest) return 'guest';
    return profile?.role ?? 'guest';
  },

  get isAuthenticated(): boolean {
    const { session, isGuest } = get();
    return session !== null || isGuest;
  },

  // Actions
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  enterGuestMode: () => set({ isGuest: true, session: null, profile: null }),
  exitGuestMode: () => set({ isGuest: false }),

  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user?.id) return;

    try {
      const profile = await getProfile(session.user.id);
      set({ profile });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session });

      if (session?.user?.id) {
        try {
          const profile = await getProfile(session.user.id);
          set({ profile });
        } catch {
          // Profile may not exist yet (first load after signup)
        }
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({
    session: null,
    profile: null,
    isLoading: false,
    isGuest: false,
  }),
}));
