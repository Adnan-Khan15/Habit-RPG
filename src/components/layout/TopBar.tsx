import { useCharacterStore } from '../../store/characterStore';
import { Avatar } from '../ui/Avatar';

export function TopBar() {
  const profile = useCharacterStore((s) => s.profile);

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="md:hidden flex items-center gap-2">
        {profile && (
          <Avatar src={profile.avatar_url} name={profile.display_name || profile.username} size="sm" />
        )}
        <h1 className="text-lg font-display text-accent-gold">Habit RPG</h1>
      </div>
      <div className="hidden md:block" />
      {profile && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-accent-gold">🪙</span>
            <span className="mono text-text-primary">{profile.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-accent-purple">⚡</span>
            <span className="mono text-text-primary">Lv.{profile.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-accent-red">❤️</span>
            <span className="mono text-text-primary">
              {profile.hp}/{profile.max_hp}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
