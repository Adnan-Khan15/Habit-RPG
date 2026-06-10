export type CharacterClass = 'warrior' | 'mage' | 'rogue';

export type TaskType = 'habit' | 'daily' | 'todo';

export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type GearSlot = 'head' | 'body' | 'weapon' | 'accessory';

export type TaskPriority = 'low' | 'normal' | 'high';

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export type AcquiredVia = 'gold_shop' | 'reward' | 'referral';

export type ThemeMode = 'dark' | 'light' | 'oled';

export const LEVEL_MILESTONES = [10, 20, 30] as const;
export type LevelMilestone = typeof LEVEL_MILESTONES[number];

export const MILESTONE_REWARDS: Record<LevelMilestone, string[]> = {
  10: ['head_shadow', 'body_shadow', 'weapon_shadow', 'accessory_shadow'],
  20: ['head_celestial', 'body_celestial', 'weapon_celestial', 'accessory_celestial'],
  30: ['head_dragon', 'body_dragon', 'weapon_dragon', 'accessory_dragon'],
};

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  character_class: CharacterClass;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  max_hp: number;
  total_tasks_completed: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  daily_reset_time: string;
  timezone: string;
  is_public: boolean;
  referral_code: string | null;
  referred_by: string | null;
  rewarded_milestones: number[];
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  type: TaskType;
  difficulty: Difficulty;
  is_positive: boolean;
  repeat_schedule: RepeatSchedule | null;
  due_date: string | null;
  priority: TaskPriority;
  tags: string[];
  is_completed: boolean;
  is_active: boolean;
  daily_target: number | null;
  daily_progress: number;
  created_at: string;
  updated_at: string;
}

export interface RepeatSchedule {
  type: 'daily' | 'weekly' | 'interval';
  days?: number[];
  interval?: number;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  xp_earned: number;
  gold_earned: number;
  streak_count: number;
}

export interface HabitStreak {
  id: string;
  user_id: string;
  task_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  streak_freeze_active: boolean;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  acquired_at: string;
  acquired_via: AcquiredVia;
}

export interface EquippedGear {
  user_id: string;
  head_item_id: string | null;
  body_item_id: string | null;
  weapon_item_id: string | null;
  accessory_item_id: string | null;
}

export interface ItemCatalogue {
  id: string;
  name: string;
  description: string | null;
  slot: GearSlot | 'consumable' | null;
  rarity: Rarity;
  gold_cost: number | null;
  unlock_level: number | null;
  sprite_key: string | null;
  icon_url: string | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendStatus;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface OfflineQueueItem {
  id: string;
  type: 'complete_task' | 'create_task' | 'update_task' | 'delete_task';
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
}
