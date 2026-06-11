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
  streakCount: number = 0,
  hasXpBoost: boolean = false
) {
  const base = DIFFICULTY_REWARDS[difficulty];
  const multiplier = getStreakBonus(streakCount) * (hasXpBoost ? 1.5 : 1);
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

export function addXpToLevel(
  currentLevel: number,
  currentXp: number,
  earnedXp: number
): { level: number; xp: number; leveledUp: boolean } {
  let progress = currentXp + earnedXp;
  let level = currentLevel;

  while (level < 50 && progress >= xpRequiredForLevel(level)) {
    progress -= xpRequiredForLevel(level);
    level++;
  }

  return {
    level,
    xp: progress,
    leveledUp: level > currentLevel,
  };
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
  collector: {
    key: 'collector',
    name: 'Collector',
    description: 'Own 10 unique cosmetic items',
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
  { id: 'hp_potion', name: 'HP Potion', description: 'Restore 20 HP', slot: 'consumable', rarity: 'common', gold_cost: 50, unlock_level: null, sprite_key: null, icon_url: null },
  { id: 'xp_boost', name: 'XP Boost', description: '1.5x XP for 1 hour', slot: 'consumable', rarity: 'uncommon', gold_cost: 200, unlock_level: null, sprite_key: null, icon_url: null },
  { id: 'name_change_token', name: 'Name Change Token', description: 'Change your display name once', slot: 'consumable', rarity: 'rare', gold_cost: 500, unlock_level: null, sprite_key: null, icon_url: null },

  { id: 'head_iron', name: 'Iron Helm', description: 'A sturdy iron helmet', slot: 'head', rarity: 'common', gold_cost: 100, unlock_level: null, sprite_key: 'head_iron', icon_url: null },
  { id: 'body_iron', name: 'Iron Chestplate', description: 'A strong iron chestplate', slot: 'body', rarity: 'common', gold_cost: 150, unlock_level: null, sprite_key: 'body_iron', icon_url: null },
  { id: 'weapon_iron', name: 'Iron Sword', description: 'A reliable iron sword', slot: 'weapon', rarity: 'common', gold_cost: 120, unlock_level: null, sprite_key: 'weapon_iron', icon_url: null },
  { id: 'accessory_iron', name: 'Iron Ring', description: 'A simple iron ring', slot: 'accessory', rarity: 'common', gold_cost: 80, unlock_level: null, sprite_key: 'accessory_iron', icon_url: null },

  // Shadow Set — purchasable from level 10
  { id: 'head_shadow', name: 'Shadow Helm', description: 'Dark, menacing helmet from the Shadow Set', slot: 'head', rarity: 'rare', gold_cost: 500, unlock_level: 10, sprite_key: 'head_shadow', icon_url: null },
  { id: 'body_shadow', name: 'Shadow Armour', description: 'Shadow-infused chestplate', slot: 'body', rarity: 'rare', gold_cost: 500, unlock_level: 10, sprite_key: 'body_shadow', icon_url: null },
  { id: 'weapon_shadow', name: 'Shadow Blade', description: 'A blade that drinks the light', slot: 'weapon', rarity: 'rare', gold_cost: 500, unlock_level: 10, sprite_key: 'weapon_shadow', icon_url: null },
  { id: 'accessory_shadow', name: 'Shadow Amulet', description: 'Pulsing with dark energy', slot: 'accessory', rarity: 'rare', gold_cost: 500, unlock_level: 10, sprite_key: 'accessory_shadow', icon_url: null },

  // Celestial Set — purchasable from level 20
  { id: 'head_celestial', name: 'Celestial Crown', description: 'Glowing halo-touched crown', slot: 'head', rarity: 'epic', gold_cost: 1000, unlock_level: 20, sprite_key: 'head_celestial', icon_url: null },
  { id: 'body_celestial', name: 'Celestial Robes', description: 'Divinely woven celestial robes', slot: 'body', rarity: 'epic', gold_cost: 1000, unlock_level: 20, sprite_key: 'body_celestial', icon_url: null },
  { id: 'weapon_celestial', name: 'Celestial Staff', description: 'Staff imbued with holy light', slot: 'weapon', rarity: 'epic', gold_cost: 1000, unlock_level: 20, sprite_key: 'weapon_celestial', icon_url: null },
  { id: 'accessory_celestial', name: 'Celestial Sigil', description: 'Symbol of the ancients', slot: 'accessory', rarity: 'epic', gold_cost: 1000, unlock_level: 20, sprite_key: 'accessory_celestial', icon_url: null },

  // Dragon Set — purchasable from level 30
  { id: 'head_dragon', name: 'Dragon Helm', description: 'Helm forged from dragon scales', slot: 'head', rarity: 'legendary', gold_cost: 2000, unlock_level: 30, sprite_key: 'head_dragon', icon_url: null },
  { id: 'body_dragon', name: 'Dragon Plate', description: 'Plate armour of the Dragon Knights', slot: 'body', rarity: 'legendary', gold_cost: 2000, unlock_level: 30, sprite_key: 'body_dragon', icon_url: null },
  { id: 'weapon_dragon', name: 'Dragon Fang', description: 'Weapon carved from a dragon fang', slot: 'weapon', rarity: 'legendary', gold_cost: 2000, unlock_level: 30, sprite_key: 'weapon_dragon', icon_url: null },
  { id: 'accessory_dragon', name: 'Dragon Heart', description: 'Crystallised dragon heart', slot: 'accessory', rarity: 'legendary', gold_cost: 2000, unlock_level: 30, sprite_key: 'accessory_dragon', icon_url: null },
] as const;

export const PETS = [
  { id: 'pet_phoenix', name: 'Phoenix', description: 'A fiery companion', unlock_level: 5, gold_cost: 1000, sprite_key: 'pet_phoenix' },
  { id: 'pet_dragonet', name: 'Dragonet', description: 'A tiny dragon', unlock_level: 10, gold_cost: 2000, sprite_key: 'pet_dragonet' },
  { id: 'pet_fox', name: 'Spirit Fox', description: 'A mystical fox', unlock_level: 15, gold_cost: 3000, sprite_key: 'pet_fox' },
  { id: 'pet_owl', name: 'Wise Owl', description: 'An ancient owl', unlock_level: 20, gold_cost: 4000, sprite_key: 'pet_owl' },
] as const;
