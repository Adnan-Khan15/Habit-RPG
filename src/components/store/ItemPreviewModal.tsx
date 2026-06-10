import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ItemCatalogue } from '../../types';
import { PhaserCanvas } from '../character/PhaserCanvas';
import { useAuthStore } from '../../store/authStore';

interface ItemPreviewModalProps {
  item: ItemCatalogue | null;
  onClose: () => void;
  onBuy?: (itemId: string) => void;
}

export function ItemPreviewModal({ item, onClose, onBuy }: ItemPreviewModalProps) {
  const profile = useAuthStore((s) => s.profile);

  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose} title={item.name}>
      <div className="flex flex-col items-center gap-4">
        <PhaserCanvas
          characterClass={profile?.character_class ?? 'warrior'}
          className="mx-auto"
        />
        <p className="text-sm text-text-muted text-center">{item.description}</p>
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {onBuy && (
            <Button className="flex-1" onClick={() => onBuy(item.id)}>
              {item.gold_cost ? `Buy for 🪙${item.gold_cost}` : 'Buy Now'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
