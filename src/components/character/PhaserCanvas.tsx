import type { CharacterClass } from '../../types';

interface PhaserCanvasProps {
  characterClass: CharacterClass;
  isFaint?: boolean;
  onLevelUp?: boolean;
  className?: string;
}

const classColors: Record<CharacterClass, string> = {
  warrior: '#ef4444',
  mage: '#7c3aed',
  rogue: '#22c55e',
};

const classEmojis: Record<CharacterClass, string> = {
  warrior: '⚔️',
  mage: '🔮',
  rogue: '🗡️',
};

const bodyParts = [
  // head
  { type: 'circle', cx: 100, cy: 70, r: 30 },
  // body
  { type: 'rect', x: 85, y: 100, w: 30, h: 50 },
  // left arm
  { type: 'rect', x: 70, y: 110, w: 15, h: 40 },
  // right arm
  { type: 'rect', x: 115, y: 110, w: 15, h: 40 },
  // left leg
  { type: 'rect', x: 90, y: 150, w: 10, h: 30 },
  // right leg
  { type: 'rect', x: 100, y: 150, w: 10, h: 30 },
];

export function PhaserCanvas({ characterClass, isFaint, className = '' }: PhaserCanvasProps) {
  const color = classColors[characterClass];
  const emoji = classEmojis[characterClass];

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ width: 200, height: 200, background: '#0f0f1a' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {bodyParts.map((part, i) =>
          part.type === 'circle' ? (
            <circle key={i} cx={part.cx} cy={part.cy} r={part.r} fill={color} />
          ) : (
            <rect key={i} x={part.x} y={part.y} width={part.w} height={part.h} fill={color} rx={3} />
          )
        )}
        {isFaint && (
          <>
            <rect x="0" y="0" width="200" height="200" fill="rgba(0,0,0,0.3)" />
            <text x="100" y="180" textAnchor="middle" fontSize="24">💀</text>
          </>
        )}
      </svg>
      <div className="absolute bottom-1 right-1 text-lg opacity-60">{emoji}</div>
    </div>
  );
}
