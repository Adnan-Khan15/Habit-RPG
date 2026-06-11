CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOL DEFAULT false
);

CREATE TABLE IF NOT EXISTS season_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  tier INT NOT NULL CHECK (tier >= 1 AND tier <= 50),
  xp_required INT NOT NULL,
  free_reward_type TEXT,
  free_reward_id TEXT,
  premium_reward_type TEXT,
  premium_reward_id TEXT,
  UNIQUE(season_id, tier)
);

CREATE TABLE IF NOT EXISTS user_season_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  current_tier INT DEFAULT 1,
  season_xp BIGINT DEFAULT 0,
  has_premium BOOL DEFAULT false,
  claimed_tiers INT[] DEFAULT '{}',
  UNIQUE(user_id, season_id)
);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Anyone can read season tiers" ON season_tiers FOR SELECT USING (true);
CREATE POLICY "Users can manage own season progress" ON user_season_progress FOR ALL USING (auth.uid() = user_id);
