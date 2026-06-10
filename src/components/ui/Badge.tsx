import type { Rarity } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'rarity' | 'achievement';
  rarity?: Rarity;
  className?: string;
}

const rarityColors: Record<Rarity, string> = {
  common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  uncommon: 'bg-green-500/20 text-green-300 border-green-500/30',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

export function Badge({ label, variant = 'default', rarity, className = '' }: BadgeProps) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border';

  const styles = {
    default: 'bg-white/5 text-text-muted border-border',
    rarity: rarity ? rarityColors[rarity] : rarityColors.common,
    achievement: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30',
  };

  return (
    <span className={`${base} ${styles[variant]} ${className}`}>
      {label}
    </span>
  );
}
