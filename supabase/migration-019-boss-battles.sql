CREATE TABLE IF NOT EXISTS boss_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_hp INT NOT NULL,
  sprite_key TEXT,
  min_party_size INT DEFAULT 2,
  reward_xp INT,
  reward_gold INT,
  reward_item_id TEXT
);

CREATE TABLE IF NOT EXISTS active_boss_fights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  boss_id TEXT REFERENCES boss_definitions(id) NOT NULL,
  current_hp INT NOT NULL,
  max_hp INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  is_defeated BOOL DEFAULT false,
  UNIQUE(party_id)
);

ALTER TABLE boss_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_boss_fights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read boss definitions" ON boss_definitions FOR SELECT USING (true);
CREATE POLICY "Party members can view boss fights" ON active_boss_fights FOR SELECT USING (true);
CREATE POLICY "Party members can update boss fights" ON active_boss_fights FOR UPDATE USING (true);
