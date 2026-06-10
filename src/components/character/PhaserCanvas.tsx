import type { CharacterClass, EquippedGear } from '../../types';
import { ITEMS_CATALOGUE } from '../../lib/xpFormulas';

interface PhaserCanvasProps {
  characterClass: CharacterClass;
  isFaint?: boolean;
  onLevelUp?: boolean;
  equippedGear?: EquippedGear | null;
  className?: string;
}

const classColors: Record<CharacterClass, string> = {
  warrior: '#ef4444',
  mage: '#7c3aed',
  rogue: '#22c55e',
};

const setTint: Record<string, string> = {
  iron: '#94a3b8',
  shadow: '#6366f1',
  celestial: '#fbbf24',
  dragon: '#f97316',
};

function getSetFromId(id: string): string | null {
  for (const set of ['shadow', 'celestial', 'dragon', 'iron']) {
    if (id.includes(set)) return set;
  }
  return null;
}

function EquipHead({ itemId, color }: { itemId: string; color: string }) {
  if (itemId.includes('iron')) {
    return <rect x="75" y="38" width="50" height="12" rx="4" fill={color} />;
  }
  if (itemId.includes('shadow')) {
    return <path d="M70 55 L100 35 L130 55" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />;
  }
  if (itemId.includes('celestial')) {
    return <circle cx="100" cy="42" r="14" fill="none" stroke={color} strokeWidth="3" opacity="0.8" />;
  }
  if (itemId.includes('dragon')) {
    return <path d="M68 50 L100 30 L132 50 L120 55 L100 38 L80 55 Z" fill={color} />;
  }
  return null;
}

function EquipBody({ color }: { color: string }) {
  return (
    <rect x="82" y="98" width="36" height="50" rx="5" fill={color} opacity="0.7" />
  );
}

function EquipWeapon({ itemId, color }: { itemId: string; color: string }) {
  const cx = 115, cy = 115;
  if (itemId.includes('iron')) {
    return <line x1={cx} y1={cy} x2={cx + 20} y2={cy - 25} stroke={color} strokeWidth="3" strokeLinecap="round" />;
  }
  if (itemId.includes('shadow')) {
    return <line x1={cx} y1={cy} x2={cx + 22} y2={cy - 28} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
  }
  if (itemId.includes('celestial')) {
    return <line x1={cx} y1={cy} x2={cx + 18} y2={cy - 30} stroke={color} strokeWidth="4" strokeLinecap="round" />;
  }
  if (itemId.includes('dragon')) {
    return <line x1={cx} y1={cy} x2={cx + 24} y2={cy - 22} stroke={color} strokeWidth="4" strokeLinecap="round" />;
  }
  return null;
}

function EquipAccessory({ itemId, color }: { itemId: string; color: string }) {
  if (itemId.includes('iron')) {
    return <circle cx="135" cy="65" r="4" fill={color} />;
  }
  if (itemId.includes('shadow')) {
    return <circle cx="135" cy="65" r="5" fill={color} opacity="0.8" />;
  }
  if (itemId.includes('celestial')) {
    return <circle cx="135" cy="65" r="6" fill="none" stroke={color} strokeWidth="2" />;
  }
  if (itemId.includes('dragon')) {
    return <circle cx="135" cy="65" r="5" fill={color} />;
  }
  return null;
}

export function PhaserCanvas({ characterClass, isFaint, equippedGear, className = '' }: PhaserCanvasProps) {
  const color = classColors[characterClass];

  const headItem = equippedGear?.head_item_id ? ITEMS_CATALOGUE.find(i => i.id === equippedGear.head_item_id) : null;
  const bodyItem = equippedGear?.body_item_id ? ITEMS_CATALOGUE.find(i => i.id === equippedGear.body_item_id) : null;
  const weaponItem = equippedGear?.weapon_item_id ? ITEMS_CATALOGUE.find(i => i.id === equippedGear.weapon_item_id) : null;
  const accessoryItem = equippedGear?.accessory_item_id ? ITEMS_CATALOGUE.find(i => i.id === equippedGear.accessory_item_id) : null;

  const headSet = equippedGear?.head_item_id ? getSetFromId(equippedGear.head_item_id) : null;
  const bodySet = equippedGear?.body_item_id ? getSetFromId(equippedGear.body_item_id) : null;
  const weaponSet = equippedGear?.weapon_item_id ? getSetFromId(equippedGear.weapon_item_id) : null;
  const accessorySet = equippedGear?.accessory_item_id ? getSetFromId(equippedGear.accessory_item_id) : null;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ width: 200, height: 200, background: '#0f0f1a' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* shadow/ambient glow */}
        <ellipse cx="100" cy="185" rx="40" ry="8" fill="rgba(255,255,255,0.05)" />

        {/* legs */}
        <rect x="92" y="152" width="8" height="28" rx="3" fill="#334155" />
        <rect x="100" y="152" width="8" height="28" rx="3" fill="#334155" />

        {/* feet */}
        <rect x="90" y="178" width="12" height="6" rx="2" fill="#1e293b" />
        <rect x="98" y="178" width="12" height="6" rx="2" fill="#1e293b" />

        {/* body/torso */}
        <rect x="85" y="102" width="30" height="50" rx="6" fill={color} opacity="0.85" />

        {/* arms */}
        <rect x="68" y="108" width="16" height="38" rx="5" fill={color} opacity="0.7" />
        <rect x="116" y="108" width="16" height="38" rx="5" fill={color} opacity="0.7" />

        {/* hands */}
        <circle cx="76" cy="148" r="5" fill="#334155" />
        <circle cx="124" cy="148" r="5" fill="#334155" />

        {/* neck */}
        <rect x="95" y="96" width="10" height="8" rx="2" fill={color} opacity="0.6" />

        {/* head */}
        <circle cx="100" cy="72" r="26" fill={color} />

        {/* eyes */}
        <ellipse cx="92" cy="68" rx="5" ry="5.5" fill="#1e293b" />
        <ellipse cx="108" cy="68" rx="5" ry="5.5" fill="#1e293b" />
        <circle cx="93" cy="67" r="2" fill="white" />
        <circle cx="109" cy="67" r="2" fill="white" />

        {/* mouth */}
        <path d="M93 80 Q100 85 107 80" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

        {/* eyebrows */}
        <line x1="87" y1="60" x2="95" y2="62" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="105" y1="62" x2="113" y2="60" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Class-specific details */}
        {characterClass === 'warrior' && (
          <>
            <rect x="78" y="75" width="44" height="6" rx="3" fill="#1e293b" opacity="0.5" />
            <rect x="80" y="100" width="40" height="4" rx="2" fill="#1e293b" opacity="0.3" />
          </>
        )}
        {characterClass === 'mage' && (
          <>
            <path d="M80 60 L100 38 L120 60" fill="none" stroke="#1e293b" strokeWidth="3" opacity="0.5" />
            <circle cx="100" cy="38" r="4" fill="#fbbf24" opacity="0.6" />
          </>
        )}
        {characterClass === 'rogue' && (
          <>
            <path d="M76 58 Q100 48 124 58 Q100 70 76 58" fill="#1e293b" opacity="0.3" />
          </>
        )}

        {/* Equipped gear overlays */}
        {headItem && headSet && (
          <EquipHead itemId={headItem.id} color={setTint[headSet]} />
        )}
        {bodyItem && bodySet && (
          <EquipBody color={setTint[bodySet]} />
        )}
        {weaponItem && weaponSet && (
          <EquipWeapon itemId={weaponItem.id} color={setTint[weaponSet]} />
        )}
        {accessoryItem && accessorySet && (
          <EquipAccessory itemId={accessoryItem.id} color={setTint[accessorySet]} />
        )}

        {/* Faint overlay */}
        {isFaint && (
          <>
            <rect x="0" y="0" width="200" height="200" fill="rgba(0,0,0,0.35)" />
            <text x="100" y="180" textAnchor="middle" fontSize="28">💀</text>
            <line x1="0" y1="0" x2="200" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="200" y1="0" x2="0" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </>
        )}
      </svg>
    </div>
  );
}
