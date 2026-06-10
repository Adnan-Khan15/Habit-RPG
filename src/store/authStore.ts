import { create } from 'zustand';
import type { Profile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: { access_token: string; refresh_token: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: AuthState['session']) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
  refreshProfile: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', get().profile?.id)
      .single();
    if (data) set({ profile: data as Profile });
  },
}));
