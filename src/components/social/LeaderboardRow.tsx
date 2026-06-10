import type { Profile } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface LeaderboardRowProps {
  entry: Profile & { rank: number };
  isCurrentUser: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isCurrentUser ? 'bg-accent-gold/10 border border-accent-gold/30' : 'hover:bg-white/5'
      }`}
    >
      <span className={`mono text-sm w-8 text-center ${
        entry.rank <= 3 ? 'text-accent-gold font-bold' : 'text-text-muted'
      }`}>
        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
      </span>

      <Avatar
        name={entry.display_name || entry.username}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {entry.display_name || entry.username}
          {isCurrentUser && <span className="text-xs text-text-muted ml-1">(you)</span>}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Badge label={entry.character_class} />
          <span className="mono">Lv.{entry.level}</span>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-accent-purple mono">{entry.xp.toLocaleString()}</p>
        {entry.current_streak > 0 && (
          <p className="text-xs text-accent-green">🔥 {entry.current_streak}</p>
        )}
      </div>
    </div>
  );
}
