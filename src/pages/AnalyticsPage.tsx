import { useState, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useTaskHistory } from '../hooks/useTaskHistory';

export default function AnalyticsPage() {
  const profile = useCharacterStore((s) => s.profile);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const { data: dailyStats, isLoading } = useTaskHistory(range, profile?.id);

  if (!profile) return null;

  const maxCount = Math.max(1, ...(dailyStats ?? []).map((d) => d.count));
  const maxXp = Math.max(1, ...(dailyStats ?? []).map((d) => d.xp));
  const today = dailyStats?.[dailyStats.length - 1];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display text-accent-gold">Analytics</h2>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                range === r
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : 'border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total Tasks" value={profile.total_tasks_completed} icon="📋" />
        <MetricCard label="Level" value={profile.level} icon="⚡" />
        <MetricCard label="Best Streak" value={profile.longest_streak} icon="🔥" />
        <MetricCard label="Total XP" value={profile.xp.toLocaleString()} icon="⭐" />
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-text-muted uppercase mb-3">
          Tasks Completed
          {today && <span className="ml-2 text-accent-green text-xs">Today: {today.count}</span>}
        </h3>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-text-muted text-sm">Loading...</div>
        ) : (
          <BarChart
            data={dailyStats ?? []}
            maxValue={maxCount}
            getColor={(d) => {
              const w = new Date(d.date).getDay();
              return d.count > 0 ? (w === 0 || w === 6 ? '#f59e0b' : '#a855f7') : '#1f2937';
            }}
            formatTooltip={(d) => `${d.date}: ${d.count} tasks (${d.xp} XP)`}
            getValue={(d) => d.count}
          />
        )}
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-text-muted uppercase mb-3">XP Earned</h3>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-text-muted text-sm">Loading...</div>
        ) : (
          <BarChart
            data={dailyStats ?? []}
            maxValue={maxXp}
            getColor={() => '#22c55e'}
            formatTooltip={(d) => `${d.date}: ${d.xp} XP`}
            getValue={(d) => d.xp}
            labelInterval={0}
          />
        )}
      </div>
    </div>
  );
}

function BarChart({
  data,
  maxValue,
  getColor,
  formatTooltip,
  getValue,
  labelInterval,
}: {
  data: { date: string; count: number; xp: number }[];
  maxValue: number;
  getColor: (d: { date: string; count: number; xp: number }) => string;
  formatTooltip: (d: { date: string; count: number; xp: number }) => string;
  getValue: (d: { date: string; count: number; xp: number }) => number;
  labelInterval?: number;
}) {
  const barWidth = useMemo(() => {
    const count = data.length;
    if (count <= 7) return 'flex-1 min-w-[20px]';
    if (count <= 30) return 'flex-1 min-w-[12px]';
    return 'min-w-[8px]';
  }, [data.length]);

  const gap = data.length > 30 ? 'gap-px' : 'gap-[3px]';
  const interval = labelInterval ?? (data.length > 45 ? 7 : data.length > 14 ? 5 : 1);

  return (
    <div className="overflow-x-auto pb-1">
      <div className={`flex items-end ${gap}`} style={{ minWidth: data.length > 30 ? `${data.length * 12}px` : 'auto', height: '8rem' }}>
        {data.map((d, i) => {
          const pct = getValue(d) / maxValue * 100;
          const showLabel = interval > 0 && i % interval === 0;
          return (
            <div key={d.date} className={`${barWidth} flex flex-col items-center ${showLabel ? 'gap-1' : 'gap-0'} group relative`}>
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-bg-card border border-border text-xs text-text-primary px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                {formatTooltip(d)}
              </div>
              <div
                className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${Math.max(pct, 3)}%`,
                  backgroundColor: getColor(d),
                }}
              />
              {showLabel && (
                <span className="text-[8px] text-text-muted">
                  {new Date(d.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="card text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xl font-bold mono text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
