interface HabitStreakBadgeProps {
  streak: number;
  className?: string;
}

export function HabitStreakBadge({ streak, className = '' }: HabitStreakBadgeProps) {
  if (streak < 1) return null;

  const intensity = Math.min(streak / 30, 1);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium mono ${className}`}
      style={{
        color: `rgb(255, ${Math.round(200 - intensity * 150)}, ${Math.round(100 - intensity * 100)})`,
      }}
    >
      <span className="text-sm">🔥</span>
      {streak}
    </span>
  );
}
