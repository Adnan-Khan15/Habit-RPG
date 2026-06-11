CREATE TABLE IF NOT EXISTS weekly_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objective_type TEXT NOT NULL,
  objective_count INT NOT NULL,
  reward_xp INT DEFAULT 0,
  reward_gold INT DEFAULT 0,
  reward_item_id TEXT,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  is_active BOOL DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT REFERENCES weekly_challenges(id) NOT NULL,
  progress INT DEFAULT 0,
  completed BOOL DEFAULT false,
  claimed BOOL DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read challenges" ON weekly_challenges
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own challenge progress" ON user_challenge_progress
  FOR ALL USING (auth.uid() = user_id);
