import { useCharacterStore } from '../store/characterStore';
import { CharacterPanel } from '../components/character/CharacterPanel';
import { PhaserCanvas } from '../components/character/PhaserCanvas';
import { GearSlots } from '../components/character/GearSlots';

export default function CharacterPage() {
  const profile = useCharacterStore((s) => s.profile);
  const isFaint = useCharacterStore((s) => s.isFaint);

  if (!profile) {
    return <div className="text-text-muted text-center py-20">Loading character...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display text-accent-gold">Character</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-4">
          <PhaserCanvas
            characterClass={profile.character_class}
            isFaint={isFaint}
            className="border border-border"
          />
        </div>
        <div className="md:col-span-2">
          <CharacterPanel />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-display text-text-primary mb-3">Equipped Gear</h3>
        <GearSlots />
      </div>
    </div>
  );
}
