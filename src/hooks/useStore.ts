import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCharacterStore } from '../store/characterStore';
import type { InventoryItem } from '../types';
import { ITEMS_CATALOGUE } from '../lib/xpFormulas';
import { checkAchievements } from '../lib/achievementChecker';

export function useStore() {
  const user = useAuthStore((s) => s.profile);
  const charProfile = useCharacterStore((s) => s.profile);
  const healHp = useCharacterStore((s) => s.healHp);
  const setXpBoostUntil = useCharacterStore((s) => s.setXpBoostUntil);
  const queryClient = useQueryClient();
  const userLevel = charProfile?.level ?? user?.level ?? 1;

  const inventoryQuery = useQuery({
    queryKey: ['inventory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);
      return (data as InventoryItem[]) ?? [];
    },
    enabled: !!user,
  });

  const purchaseItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user || !charProfile) throw new Error('Not authenticated');
      const item = ITEMS_CATALOGUE.find((i) => i.id === itemId);
      if (!item || !item.gold_cost) throw new Error('Item not available');
      if (item.unlock_level && charProfile.level < item.unlock_level) {
        throw new Error(`Requires level ${item.unlock_level}`);
      }
      if (charProfile.gold < item.gold_cost) throw new Error('Not enough gold');

      const { data: existing } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle();
      if (existing) throw new Error('Already owned');

      const { error } = await supabase.from('inventory').insert({
        user_id: user.id,
        item_id: itemId,
        quantity: 1,
        acquired_via: 'gold_shop',
      });
      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ gold: charProfile.gold - item.gold_cost })
        .eq('id', user.id);
      useCharacterStore.getState().addGold(-item.gold_cost);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });

      if (user && charProfile) {
        const [achievementsRes, inventoryRes] = await Promise.all([
          supabase.from('user_achievements').select('*').eq('user_id', user.id),
          supabase.from('inventory').select('id').eq('user_id', user.id),
        ]);
        const result = checkAchievements(
          charProfile,
          (achievementsRes.data ?? []) as any,
          { ownedItemCount: (inventoryRes.data ?? []).length }
        );
        if (result.newlyUnlocked.length > 0) {
          await supabase.from('user_achievements').insert(
            result.newlyUnlocked.map((key) => ({ user_id: user.id, achievement_key: key }))
          );
          queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
        }
      }
    },
  });

  const useConsumable = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user || !charProfile) throw new Error('Not authenticated');

      const invItem = (inventoryQuery.data ?? []).find((i) => i.item_id === itemId);
      if (!invItem) throw new Error('Item not in inventory');

      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', invItem.id);
      if (error) throw error;

      if (itemId === 'hp_potion') {
        const newHp = Math.min(charProfile.max_hp, charProfile.hp + 20);
        await supabase
          .from('profiles')
          .update({ hp: newHp })
          .eq('id', user.id);
        healHp(20);
      } else if (itemId === 'xp_boost') {
        const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await supabase
          .from('profiles')
          .update({ xp_boost_until: until })
          .eq('id', user.id);
        setXpBoostUntil(until);
      } else if (itemId === 'name_change_token') {
        // handled in UI with prompt before calling mutation
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const ownedItemIds = new Set(
    (inventoryQuery.data ?? []).map((i) => i.item_id)
  );

  const catalogue = ITEMS_CATALOGUE.map((item) => ({
    ...item,
    owned: ownedItemIds.has(item.id),
    locked: item.unlock_level ? userLevel < item.unlock_level : false,
  }));

  return {
    catalogue,
    inventory: inventoryQuery.data ?? [],
    isLoading: inventoryQuery.isLoading,
    purchaseItem,
    useConsumable,
  };
}
