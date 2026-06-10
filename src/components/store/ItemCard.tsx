import { motion } from 'framer-motion';
import type { ItemCatalogue } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ItemCardProps {
  item: ItemCatalogue & { owned: boolean; locked: boolean };
  onBuy: (itemId: string) => void;
  onPreview?: (item: ItemCatalogue) => void;
}

const rarityBorders: Record<string, string> = {
  common: 'border-gray-500/30',
  uncommon: 'border-green-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30',
};

export function ItemCard({ item, onBuy, onPreview }: ItemCardProps) {
  return (
    <motion.div
      whileHover={item.locked ? {} : { scale: 1.02, rotateY: 5 }}
      className={`card-hover flex flex-col ${rarityBorders[item.rarity]} ${item.owned || item.locked ? 'opacity-60' : ''}`}
    >
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 cursor-pointer"
        onClick={() => !item.locked && onPreview?.(item)}
      >
        <div className="w-16 h-16 rounded-lg bg-accent-purple/10 flex items-center justify-center text-2xl mb-2">
          {item.slot === 'head' ? '🪖' : item.slot === 'body' ? '👕' : item.slot === 'weapon' ? '🗡️' : item.slot === 'accessory' ? '💍' : '🧪'}
        </div>
        <h4 className="text-sm font-semibold text-text-primary text-center">{item.name}</h4>
        <p className="text-xs text-text-muted text-center mt-1 capitalize">{item.rarity}</p>
        {item.locked && item.unlock_level && (
          <Badge label={`Lv.${item.unlock_level}`} className="mt-2" />
        )}
        {item.owned && !item.locked && (
          <Badge label="Owned" variant="achievement" className="mt-2" />
        )}
        {!item.owned && !item.locked && item.gold_cost && (
          <p className="text-xs text-accent-gold mono mt-2">🪙 {item.gold_cost}</p>
        )}
      </div>

      <div className="p-3 border-t border-border">
        {item.locked ? (
          <Button variant="ghost" className="w-full" disabled>
            🔒 Lv.{item.unlock_level}
          </Button>
        ) : item.owned ? (
          <Button variant="ghost" className="w-full" disabled>
            Owned
          </Button>
        ) : item.gold_cost ? (
          <Button className="w-full" onClick={() => onBuy(item.id)}>
            🪙 {item.gold_cost}
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}
