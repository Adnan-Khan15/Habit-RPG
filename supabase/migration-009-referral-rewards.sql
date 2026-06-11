CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rewarded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral rewards" ON referral_rewards
  FOR SELECT USING (auth.uid() = referrer_id);
