import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { InventoryItem } from '../types';
import { ITEMS_CATALOGUE } from '../lib/xpFormulas';

export function useStore() {
  const user = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
  const userLevel = user?.level ?? 1;

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
      if (!user) throw new Error('Not authenticated');
      const item = ITEMS_CATALOGUE.find((i) => i.id === itemId);
      if (!item || !item.gold_cost) throw new Error('Item not available');
      if (item.unlock_level && user.level < item.unlock_level) {
        throw new Error(`Requires level ${item.unlock_level}`);
      }
      if (user.gold < item.gold_cost) throw new Error('Not enough gold');

      const { error } = await supabase.from('inventory').upsert(
        {
          user_id: user.id,
          item_id: itemId,
          quantity: 1,
          acquired_via: 'gold_shop',
        },
        { onConflict: 'user_id, item_id', ignoreDuplicates: true }
      );
      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ gold: user.gold - item.gold_cost })
        .eq('id', user.id);
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
  };
}
