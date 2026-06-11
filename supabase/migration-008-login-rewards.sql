CREATE TABLE IF NOT EXISTS login_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  claimed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  login_streak INT NOT NULL DEFAULT 1,
  reward_type TEXT NOT NULL,
  reward_amount INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, claimed_at)
);

ALTER TABLE login_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login rewards" ON login_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own login rewards" ON login_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
