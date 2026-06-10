import type { Difficulty } from '../types';

const DIFFICULTY_REWARDS: Record<Difficulty, { xp: number; gold: number }> = {
  trivial: { xp: 10, gold: 5 },
  easy: { xp: 25, gold: 10 },
  medium: { xp: 50, gold: 20 },
  hard: { xp: 100, gold: 40 },
};

export function getBaseRewards(difficulty: Difficulty) {
  return DIFFICULTY_REWARDS[difficulty];
}

export function getStreakBonus(streakCount: number): number {
  const bonus = Math.min(streakCount * 0.1, 0.5);
  return 1 + bonus;
}

export function calculateRewards(
  difficulty: Difficulty,
  streakCount: number = 0
) {
  const base = DIFFICULTY_REWARDS[difficulty];
  const multiplier = getStreakBonus(streakCount);
  return {
    xp: Math.round(base.xp * multiplier),
    gold: base.gold,
  };
}

export function xpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5) / 10) * 10;
}

export function calculateLevel(xp: number): number {
  let level = 1;
  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level++;
  }
  return Math.min(level, 50);
}

export function calculateLevelProgress(xp: number, level: number): number {
  const xpForNext = xpRequiredForLevel(level + 1);
  return xp / xpForNext;
}

export function calculateMaxHp(level: number): number {
  return 50 + level * 5;
}

export const ACHIEVEMENTS = {
  first_blood: {
    key: 'first_blood',
    name: 'First Blood',
    description: 'Complete your first task',
    icon: '⚔️',
  },
  creature_of_habit: {
    key: 'creature_of_habit',
    name: 'Creature of Habit',
    description: 'Complete the same habit 7 days in a row',
    icon: '🔥',
  },
  on_fire: {
    key: 'on_fire',
    name: 'On Fire',
    description: '30-day streak',
    icon: '💥',
  },
  century: {
    key: 'century',
    name: 'Century',
    description: '100-day streak',
    icon: '🏆',
  },
  shopaholic: {
    key: 'shopaholic',
    name: 'Shopaholic',
    description: 'Buy 5 items from the gold shop',
    icon: '🛒',
  },
  patron: {
    key: 'patron',
    name: 'Patron',
    description: 'Make any Stripe purchase',
    icon: '💎',
  },
  social_butterfly: {
    key: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Add 5 friends',
    icon: '🦋',
  },
  top_10: {
    key: 'top_10',
    name: 'Top 10',
    description: 'Reach global leaderboard top 10',
    icon: '👑',
  },
  max_level: {
    key: 'max_level',
    name: 'Max Level',
    description: 'Reach level 50',
    icon: '🌟',
  },
  task_master: {
    key: 'task_master',
    name: 'Task Master',
    description: 'Complete 500 total tasks',
    icon: '📜',
  },
} as const;

export const ITEMS_CATALOGUE = [
  { id: 'hp_potion', name: 'HP Potion', description: 'Restore 20 HP', slot: 'consumable', rarity: 'common', gold_cost: 50, stripe_pack_id: null, sprite_key: null, icon_url: null },
  { id: 'xp_boost', name: 'XP Boost', description: '1.5x XP for 1 hour', slot: 'consumable', rarity: 'uncommon', gold_cost: 200, stripe_pack_id: null, sprite_key: null, icon_url: null },
  { id: 'name_change_token', name: 'Name Change Token', description: 'Change your display name once', slot: 'consumable', rarity: 'rare', gold_cost: 500, stripe_pack_id: null, sprite_key: null, icon_url: null },
  { id: 'head_iron', name: 'Iron Helm', description: 'A sturdy iron helmet', slot: 'head', rarity: 'common', gold_cost: 100, stripe_pack_id: null, sprite_key: 'head_iron', icon_url: null },
  { id: 'body_iron', name: 'Iron Chestplate', description: 'A strong iron chestplate', slot: 'body', rarity: 'common', gold_cost: 150, stripe_pack_id: null, sprite_key: 'body_iron', icon_url: null },
  { id: 'weapon_iron', name: 'Iron Sword', description: 'A reliable iron sword', slot: 'weapon', rarity: 'common', gold_cost: 120, stripe_pack_id: null, sprite_key: 'weapon_iron', icon_url: null },
  { id: 'accessory_iron', name: 'Iron Ring', description: 'A simple iron ring', slot: 'accessory', rarity: 'common', gold_cost: 80, stripe_pack_id: null, sprite_key: 'accessory_iron', icon_url: null },
] as const;
