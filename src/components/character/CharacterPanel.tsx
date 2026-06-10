import { useCharacterStore } from '../../store/characterStore';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { xpRequiredForLevel } from '../../lib/xpFormulas';
import type { CharacterClass } from '../../types';

const classEmojis: Record<CharacterClass, string> = {
  warrior: '⚔️',
  mage: '🔮',
  rogue: '🗡️',
};

export function CharacterPanel() {
  const profile = useCharacterStore((s) => s.profile);
  const isFaint = useCharacterStore((s) => s.isFaint);

  if (!profile) return null;

  const xpForNext = xpRequiredForLevel(profile.level);

  return (
    <div className={`card space-y-4 ${isFaint ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center text-3xl">
          {classEmojis[profile.character_class]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg text-text-primary">{profile.display_name || profile.username}</h3>
            <Badge label={profile.character_class} />
          </div>
          <p className="text-sm text-text-muted mono">Lv.{profile.level}</p>
        </div>
      </div>

      {isFaint && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-2 text-center">
          <p className="text-xs text-accent-red font-semibold">💀 Fainted — 24hr debuff active</p>
        </div>
      )}

      <ProgressBar value={profile.xp} max={xpForNext} variant="xp" />
      <ProgressBar value={profile.hp} max={profile.max_hp} variant="hp" />

      <div className="flex justify-between text-sm">
        <div className="text-accent-gold flex items-center gap-1">
          <span>🪙</span>
          <span className="mono">{profile.gold}</span>
        </div>
        <div className="text-text-muted flex items-center gap-1">
          <span>📊</span>
          <span className="mono">{profile.total_tasks_completed} tasks</span>
        </div>
      </div>

      {profile.current_streak > 0 && (
        <div className="text-accent-green text-sm flex items-center gap-1 justify-center">
          <span>🔥</span>
          <span className="font-semibold">{profile.current_streak}-day streak</span>
        </div>
      )}
    </div>
  );
}
