CREATE TABLE IF NOT EXISTS pvp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES profiles(id) NOT NULL,
  opponent_id UUID REFERENCES profiles(id) NOT NULL,
  week_start DATE NOT NULL,
  challenger_score INT DEFAULT 0,
  opponent_score INT DEFAULT 0,
  challenger_claimed BOOL DEFAULT false,
  opponent_claimed BOOL DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  UNIQUE(challenger_id, opponent_id, week_start)
);

ALTER TABLE pvp_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own PvP challenges" ON pvp_challenges FOR SELECT USING (auth.uid() IN (challenger_id, opponent_id));
CREATE POLICY "Users can create PvP challenges" ON pvp_challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update own PvP challenges" ON pvp_challenges FOR UPDATE USING (auth.uid() IN (challenger_id, opponent_id));
