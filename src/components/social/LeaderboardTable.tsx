import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAuthStore } from '../../store/authStore';
import { LeaderboardRow } from './LeaderboardRow';

export function LeaderboardTable() {
  const { entries, isLoading } = useLeaderboard();
  const profile = useAuthStore((s) => s.profile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-text-muted">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-muted">Global Leaderboard</h3>
        <span className="text-xs text-text-muted">{entries.length} players</span>
      </div>

      <div className="space-y-1">
        {entries.map((entry) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            isCurrentUser={entry.id === profile?.id}
          />
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-center text-text-muted py-12">No public players yet</p>
      )}
    </div>
  );
}
