import { useStore } from '../../hooks/useStore';
import { useCharacter } from '../../hooks/useCharacter';
import { useCharacterStore } from '../../store/characterStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ItemCard } from './ItemCard';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export function StoreGrid() {
  const { catalogue, purchaseItem, useConsumable } = useStore();
  const { equipItem, unequipItem } = useCharacter();
  const equippedGear = useCharacterStore((s) => s.equippedGear);
  const profile = useCharacterStore((s) => s.profile);
  const addToast = useNotificationStore((s) => s.addToast);
  const user = useAuthStore((s) => s.profile);

  const equippedIds = new Set(
    equippedGear
      ? [equippedGear.head_item_id, equippedGear.body_item_id, equippedGear.weapon_item_id, equippedGear.accessory_item_id].filter(Boolean)
      : []
  );

  const handleBuy = async (itemId: string) => {
    try {
      await purchaseItem.mutateAsync(itemId);
      addToast({ type: 'success', title: 'Purchase complete!' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Purchase failed', message: err.message });
    }
  };

  const handleUse = async (itemId: string) => {
    if (itemId === 'name_change_token') {
      const newName = prompt('Enter a new display name (max 20 chars):');
      if (!newName || !newName.trim()) return;
      const name = newName.trim().slice(0, 20);
      await useConsumable.mutateAsync(itemId);
      if (user && profile) {
        await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
        addToast({ type: 'success', title: `Renamed to ${name}!` });
      }
    } else if (itemId === 'xp_boost') {
      if (!confirm('Activate 1.5x XP boost for 1 hour?')) return;
      await useConsumable.mutateAsync(itemId);
      addToast({ type: 'success', title: 'XP Boost active for 1 hour!' });
    } else {
      await useConsumable.mutateAsync(itemId);
      addToast({ type: 'success', title: 'Used item!' });
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      await equipItem.mutateAsync(itemId);
      addToast({ type: 'success', title: 'Item equipped!' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Equip failed', message: err.message });
    }
  };

  const handleUnequip = async (itemId: string) => {
    const item = catalogue.find((i) => i.id === itemId);
    if (!item?.slot) return;
    try {
      await unequipItem.mutateAsync(item.slot as any);
      addToast({ type: 'info', title: 'Item unequipped' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Unequip failed', message: err.message });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-display text-accent-gold mb-4">Item Store</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {catalogue.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isEquipped={equippedIds.has(item.id)}
            onBuy={handleBuy}
            onUse={handleUse}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        ))}
      </div>
    </div>
  );
}
