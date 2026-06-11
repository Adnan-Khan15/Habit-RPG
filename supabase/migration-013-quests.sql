CREATE TABLE IF NOT EXISTS quests_catalogue (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  flavor_text TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  reward_xp INT DEFAULT 0,
  reward_gold INT DEFAULT 0,
  reward_item_id TEXT,
  required_level INT DEFAULT 1,
  class_restriction TEXT,
  expires_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT REFERENCES quests_catalogue(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  progress JSONB NOT NULL DEFAULT '{"step_index": 0, "step_progress": 0}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id)
);

ALTER TABLE quests_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quest catalogue" ON quests_catalogue FOR SELECT USING (true);
CREATE POLICY "Users can manage own quests" ON user_quests FOR ALL USING (auth.uid() = user_id);
