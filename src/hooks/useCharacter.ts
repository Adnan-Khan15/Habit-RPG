import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCharacterStore } from '../store/characterStore';
import { MILESTONE_REWARDS, LEVEL_MILESTONES } from '../types';
import type { Profile, EquippedGear, GearSlot } from '../types';
import { ITEMS_CATALOGUE } from '../lib/xpFormulas';

export function useCharacter() {
  const user = useAuthStore((s) => s.profile);
  const setProfile = useCharacterStore((s) => s.setProfile);
  const setEquippedGear = useCharacterStore((s) => s.setEquippedGear);
  const queryClient = useQueryClient();

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
        await claimMilestoneRewards(profile);
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

  const equipItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('Not authenticated');
      const item = ITEMS_CATALOGUE.find(i => i.id === itemId);
      if (!item || item.slot === 'consumable') throw new Error('Cannot equip this item');

      const slot = item.slot as GearSlot;
      const column = `${slot}_item_id` as const;

      const existing = await supabase
        .from('equipped_gear')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing.data) {
        await supabase
          .from('equipped_gear')
          .update({ [column]: itemId })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('equipped_gear')
          .insert({ user_id: user.id, [column]: itemId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equippedGear', user?.id] });
    },
  });

  const unequipItem = useMutation({
    mutationFn: async (slot: GearSlot) => {
      if (!user) throw new Error('Not authenticated');
      const column = `${slot}_item_id` as const;
      await supabase
        .from('equipped_gear')
        .update({ [column]: null })
        .eq('user_id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equippedGear', user?.id] });
    },
  });

  return {
    profile: profileQuery.data,
    equippedGear: gearQuery.data,
    isLoading: profileQuery.isLoading,
    equipItem,
    unequipItem,
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
