import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCharacterStore } from '../store/characterStore';
import { MILESTONE_REWARDS, LEVEL_MILESTONES } from '../types';
import type { Profile, EquippedGear } from '../types';

export function useCharacter() {
  const user = useAuthStore((s) => s.profile);
  const setProfile = useCharacterStore((s) => s.setProfile);
  const setEquippedGear = useCharacterStore((s) => s.setEquippedGear);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      const profile = data as Profile | null;

      if (profile) {
        // Claim any unrewarded milestones on load (safety net)
        await claimMilestoneRewards(profile);
        // Refresh after claiming
        const { data: refreshed } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (refreshed) setProfile(refreshed as Profile);
      }

      return profile;
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
      const gear = data as EquippedGear | null;
      if (gear) setEquippedGear(gear);
      return gear;
    },
    enabled: !!user,
  });

  return {
    profile: profileQuery.data,
    equippedGear: gearQuery.data,
    isLoading: profileQuery.isLoading,
  };
}

export async function claimMilestoneRewards(profile: Profile) {
  const rewarded = profile.rewarded_milestones ?? [];
  const newlyClaimed: number[] = [];

  for (const milestone of LEVEL_MILESTONES) {
    if (profile.level >= milestone && !rewarded.includes(milestone)) {
      newlyClaimed.push(milestone);
    }
  }

  if (newlyClaimed.length === 0) return [];

  const allItemIds: string[] = [];
  for (const ms of newlyClaimed) {
    const items = MILESTONE_REWARDS[ms as keyof typeof MILESTONE_REWARDS] ?? [];
    allItemIds.push(...items);
  }

  for (const itemId of allItemIds) {
    await supabase.from('inventory').upsert(
      {
        user_id: profile.id,
        item_id: itemId,
        quantity: 1,
        acquired_via: 'reward',
      },
      { onConflict: 'user_id, item_id', ignoreDuplicates: true }
    );
  }

  await supabase
    .from('profiles')
    .update({ rewarded_milestones: [...rewarded, ...newlyClaimed] })
    .eq('id', profile.id);

  return newlyClaimed;
}
