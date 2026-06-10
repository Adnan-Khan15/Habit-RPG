-- Habit RPG Database Schema
-- Run this in Supabase SQL Editor

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  character_class TEXT DEFAULT 'warrior' CHECK (character_class IN ('warrior', 'mage', 'rogue')),
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  gold INT DEFAULT 0,
  hp INT DEFAULT 50,
  max_hp INT DEFAULT 50,
  total_tasks_completed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  daily_reset_time TIME DEFAULT '00:00:00',
  timezone TEXT DEFAULT 'UTC',
  is_public BOOL DEFAULT true,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  rewarded_milestones INT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  type TEXT NOT NULL CHECK (type IN ('habit', 'daily', 'todo')),
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('trivial', 'easy', 'medium', 'hard')),
  is_positive BOOL DEFAULT true,
  repeat_schedule JSONB,
  due_date DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  tags TEXT[] DEFAULT '{}',
  daily_target INT,
  daily_progress INT DEFAULT 0,
  is_completed BOOL DEFAULT false,
  is_active BOOL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- 3. TASK COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  xp_earned INT,
  gold_earned INT,
  streak_count INT DEFAULT 0
);

ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON task_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON task_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. HABIT STREAKS TABLE
CREATE TABLE IF NOT EXISTS habit_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_completed_date DATE,
  streak_freeze_active BOOL DEFAULT false,
  UNIQUE(user_id, task_id)
);

ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit streaks" ON habit_streaks
  FOR ALL USING (auth.uid() = user_id);

-- 5. ITEMS CATALOGUE (static seed data)
CREATE TABLE IF NOT EXISTS items_catalogue (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slot TEXT CHECK (slot IN ('head', 'body', 'weapon', 'accessory', 'consumable')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  gold_cost INT,
  unlock_level INT,
  sprite_key TEXT,
  icon_url TEXT
);

ALTER TABLE items_catalogue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items catalogue is readable by all" ON items_catalogue
  FOR SELECT USING (true);

-- 6. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL REFERENCES items_catalogue(id),
  quantity INT DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT now(),
  acquired_via TEXT DEFAULT 'gold_shop' CHECK (acquired_via IN ('gold_shop', 'reward', 'referral'))
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inventory" ON inventory
  FOR ALL USING (auth.uid() = user_id);

-- 7. EQUIPPED GEAR TABLE
CREATE TABLE IF NOT EXISTS equipped_gear (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  head_item_id TEXT,
  body_item_id TEXT,
  weapon_item_id TEXT,
  accessory_item_id TEXT
);

ALTER TABLE equipped_gear ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own equipped gear" ON equipped_gear
  FOR ALL USING (auth.uid() = user_id);

-- 8. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can insert own friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 9. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by all" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Only edge functions can insert achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 10. LEADERBOARD VIEW
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id, username, display_name, avatar_url, character_class,
  level, xp, current_streak
FROM profiles
WHERE is_public = true
ORDER BY xp DESC
LIMIT 100;

-- 11. SEED ITEMS CATALOGUE
INSERT INTO items_catalogue (id, name, description, slot, rarity, gold_cost, unlock_level, sprite_key) VALUES
  ('hp_potion', 'HP Potion', 'Restore 20 HP', 'consumable', 'common', 50, NULL, NULL),
  ('xp_boost', 'XP Boost', '1.5x XP for 1 hour', 'consumable', 'uncommon', 200, NULL, NULL),
  ('name_change_token', 'Name Change Token', 'Change your display name once', 'consumable', 'rare', 500, NULL, NULL),
  ('head_iron', 'Iron Helm', 'A sturdy iron helmet', 'head', 'common', 100, NULL, 'head_iron'),
  ('body_iron', 'Iron Chestplate', 'A strong iron chestplate', 'body', 'common', 150, NULL, 'body_iron'),
  ('weapon_iron', 'Iron Sword', 'A reliable iron sword', 'weapon', 'common', 120, NULL, 'weapon_iron'),
  ('accessory_iron', 'Iron Ring', 'A simple iron ring', 'accessory', 'common', 80, NULL, 'accessory_iron'),
  -- Shadow Set — rare, level 10 gate
  ('head_shadow', 'Shadow Helm', 'Dark, menacing helmet', 'head', 'rare', 500, 10, 'head_shadow'),
  ('body_shadow', 'Shadow Armour', 'Shadow-infused chestplate', 'body', 'rare', 500, 10, 'body_shadow'),
  ('weapon_shadow', 'Shadow Blade', 'A blade that drinks the light', 'weapon', 'rare', 500, 10, 'weapon_shadow'),
  ('accessory_shadow', 'Shadow Amulet', 'Pulsing with dark energy', 'accessory', 'rare', 500, 10, 'accessory_shadow'),
  -- Celestial Set — epic, level 20 gate
  ('head_celestial', 'Celestial Crown', 'Glowing halo-touched crown', 'head', 'epic', 1000, 20, 'head_celestial'),
  ('body_celestial', 'Celestial Robes', 'Divinely woven celestial robes', 'body', 'epic', 1000, 20, 'body_celestial'),
  ('weapon_celestial', 'Celestial Staff', 'Staff imbued with holy light', 'weapon', 'epic', 1000, 20, 'weapon_celestial'),
  ('accessory_celestial', 'Celestial Sigil', 'Symbol of the ancients', 'accessory', 'epic', 1000, 20, 'accessory_celestial'),
  -- Dragon Set — legendary, level 30 gate
  ('head_dragon', 'Dragon Helm', 'Helm forged from dragon scales', 'head', 'legendary', 2000, 30, 'head_dragon'),
  ('body_dragon', 'Dragon Plate', 'Plate armour of the Dragon Knights', 'body', 'legendary', 2000, 30, 'body_dragon'),
  ('weapon_dragon', 'Dragon Fang', 'Weapon carved from a dragon fang', 'weapon', 'legendary', 2000, 30, 'weapon_dragon'),
  ('accessory_dragon', 'Dragon Heart', 'Crystallised dragon heart', 'accessory', 'legendary', 2000, 30, 'accessory_dragon')
ON CONFLICT (id) DO NOTHING;

-- 12. Enable Realtime for profiles (for leaderboard)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
