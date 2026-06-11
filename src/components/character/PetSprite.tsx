const PET_SPRITES: Record<string, string> = {
  pet_phoenix: '#ef4444',
  pet_dragonet: '#22c55e',
  pet_fox: '#f59e0b',
  pet_owl: '#a855f7',
};

const PET_PATHS: Record<string, string> = {
  pet_phoenix: 'M16,20 C16,16 12,14 8,14 C4,14 0,16 0,20 C0,22 2,24 8,28 C14,24 16,22 16,20Z',
  pet_dragonet: 'M12,24 C12,18 8,12 4,10 C2,9 0,8 0,10 C0,14 4,18 4,22 C4,26 8,28 12,24Z',
  pet_fox: 'M14,22 C14,18 10,14 6,14 C2,14 0,16 0,20 C0,24 4,28 8,28 C12,28 14,24 14,22Z',
  pet_owl: 'M10,18 C10,14 6,12 2,12 C0,12 0,14 0,16 C0,20 4,24 4,26 C2,26 0,24 0,26 C0,30 6,30 10,26 C14,22 10,20 10,18Z',
};

const PET_EYES: Record<string, { x: number; y: number }> = {
  pet_phoenix: { x: 6, y: 17 },
  pet_dragonet: { x: 4, y: 13 },
  pet_fox: { x: 4, y: 17 },
  pet_owl: { x: 3, y: 15 },
};

export function PetSprite({ petId, size = 40 }: { petId: string; size?: number }) {
  const color = PET_SPRITES[petId] ?? '#a855f7';
  const path = PET_PATHS[petId] ?? PET_PATHS.pet_phoenix;
  const eye = PET_EYES[petId] ?? PET_EYES.pet_phoenix;

  return (
    <svg width={size} height={size} viewBox="0 0 16 32" className="inline-block">
      <path d={path} fill={color} opacity="0.9" />
      <circle cx={eye.x} cy={eye.y} r="1.5" fill="white" />
      <circle cx={eye.x} cy={eye.y} r="0.8" fill="#1a1a2e" />
    </svg>
  );
}
