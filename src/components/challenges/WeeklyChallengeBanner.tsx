import { useWeeklyChallenge } from '../../hooks/useWeeklyChallenge';

export function WeeklyChallengeBanner() {
  const { challenge, progress, isLoading, claimReward } = useWeeklyChallenge();

  if (isLoading || !challenge || !progress) return null;

  const pct = Math.min(100, Math.round((progress.progress / challenge.objective_count) * 100));
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / 86400000));

  return (
    <div className="bg-gradient-to-r from-accent-purple/10 to-accent-gold/10 border border-accent-purple/20 rounded-lg px-4 py-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-semibold text-accent-gold uppercase">Weekly Challenge</span>
          <h4 className="text-sm font-medium text-text-primary">{challenge.title}</h4>
          <p className="text-xs text-text-muted">{challenge.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted">{daysLeft}d left</div>
          {progress.completed && !progress.claimed && (
            <button
              onClick={() => claimReward.mutate()}
              disabled={claimReward.isPending}
              className="mt-1 text-xs bg-accent-gold text-bg-primary px-3 py-1 rounded-lg font-medium hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
            >
              {claimReward.isPending ? 'Claiming...' : 'Claim Reward'}
            </button>
          )}
          {progress.claimed && (
            <span className="text-xs text-accent-green">Claimed ✓</span>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-purple rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-text-muted mt-1">
        {progress.progress} / {challenge.objective_count} · +{challenge.reward_xp} XP · +{challenge.reward_gold}🪙
      </div>
    </div>
  );
}
