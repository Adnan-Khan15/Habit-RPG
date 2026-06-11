CREATE TABLE IF NOT EXISTS skill_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  class_restriction TEXT CHECK (class_restriction IN ('warrior', 'mage', 'rogue')),
  max_level INT DEFAULT 1,
  effect_type TEXT NOT NULL,
  effect_value NUMERIC NOT NULL,
  required_level INT DEFAULT 1,
  required_parent_skill TEXT REFERENCES skill_definitions(id),
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id TEXT REFERENCES skill_definitions(id) NOT NULL,
  current_level INT DEFAULT 1,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

ALTER TABLE skill_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read skill definitions" ON skill_definitions FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

INSERT INTO skill_definitions (id, name, description, class_restriction, max_level, effect_type, effect_value, required_level, sort_order) VALUES
  ('war_dailies', 'Daily Discipline', '+5% XP from dailies per level', 'warrior', 5, 'xp_bonus_daily', 5, 1, 1),
  ('war_sturdy', 'Sturdy Constitution', '-1 HP damage from negative habits per level', 'warrior', 3, 'damage_reduction', 1, 5, 2),
  ('mage_habits', 'Arcane Income', '+5% gold from habits per level', 'mage', 5, 'gold_bonus_habit', 5, 1, 3),
  ('mage_insight', 'Twilight Insight', '+10% XP from tasks completed after 8PM per level', 'mage', 3, 'xp_bonus_night', 10, 5, 4),
  ('rogue_todos', 'Contract Killer', '+5% XP from to-dos per level', 'rogue', 5, 'xp_bonus_todo', 5, 1, 5),
  ('rogue_stealth', 'Shadow Step', '1 streak freeze per week per level', 'rogue', 3, 'streak_freeze', 1, 5, 6)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unspent_skill_points INT DEFAULT 0;
