import { useStore } from '../../hooks/useStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ItemCard } from './ItemCard';

export function StoreGrid() {
  const { catalogue, purchaseItem } = useStore();
  const addToast = useNotificationStore((s) => s.addToast);

  const handleBuy = async (itemId: string) => {
    try {
      await purchaseItem.mutateAsync(itemId);
      addToast({ type: 'success', title: 'Purchase complete!' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Purchase failed', message: err.message });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-display text-accent-gold mb-4">Item Store</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {catalogue.map((item) => (
          <ItemCard key={item.id} item={item} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  );
}
