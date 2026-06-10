import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'xp' | 'hp' | 'gold';
  showLabel?: boolean;
  className?: string;
}

const variants = {
  xp: { bg: 'bg-accent-purple/20', fill: 'bg-accent-purple', glow: 'rgba(124,58,237,0.4)' },
  hp: { bg: 'bg-accent-red/20', fill: 'bg-accent-red', glow: 'rgba(239,68,68,0.4)' },
  gold: { bg: 'bg-accent-gold/20', fill: 'bg-accent-gold', glow: 'rgba(245,200,66,0.4)' },
};

export function ProgressBar({ value, max, variant = 'xp', showLabel = true, className = '' }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const v = variants[variant];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-text-muted font-medium capitalize">{variant}</span>
          <span className="mono text-text-primary">
            {value}/{max}
          </span>
        </div>
      )}
      <div className={`h-2 rounded-full ${v.bg} overflow-hidden relative`}>
        <motion.div
          className={`h-full rounded-full ${v.fill} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ boxShadow: `0 0 8px ${v.glow}` }}
        />
      </div>
    </div>
  );
}
