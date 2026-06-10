import { useCharacterStore } from '../../store/characterStore';
import type { GearSlot } from '../../types';

const slotLabels: Record<GearSlot, string> = {
  head: 'Head',
  body: 'Body',
  weapon: 'Weapon',
  accessory: 'Accessory',
};

const slotEmojis: Record<GearSlot, string> = {
  head: '🪖',
  body: '👕',
  weapon: '🗡️',
  accessory: '💍',
};

export function GearSlots() {
  const equippedGear = useCharacterStore((s) => s.equippedGear);

  const slots: GearSlot[] = ['head', 'body', 'weapon', 'accessory'];

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => {
        const itemId = equippedGear?.[`${slot}_item_id` as keyof typeof equippedGear] as string | null;
        return (
          <div
            key={slot}
            className="bg-bg-primary rounded-lg border border-border p-3 flex items-center gap-3"
          >
            <span className="text-xl">{slotEmojis[slot]}</span>
            <div>
              <p className="text-xs text-text-muted uppercase">{slotLabels[slot]}</p>
              <p className="text-sm font-medium text-text-primary">
                {itemId ? itemId.replace(`${slot}_`, '').replace('_', ' ') : 'Empty'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
