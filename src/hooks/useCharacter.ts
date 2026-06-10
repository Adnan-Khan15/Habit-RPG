import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Profile, EquippedGear } from '../types';

export function useCharacter() {
  const user = useAuthStore((s) => s.profile);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const gearQuery = useQuery({
    queryKey: ['equippedGear', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('equipped_gear')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data as EquippedGear | null;
    },
    enabled: !!user,
  });

  return {
    profile: profileQuery.data,
    equippedGear: gearQuery.data,
    isLoading: profileQuery.isLoading,
  };
}
