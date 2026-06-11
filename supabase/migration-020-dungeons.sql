CREATE TABLE IF NOT EXISTS dungeon_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quest_ids TEXT[] NOT NULL,
  required_level INT DEFAULT 1,
  completion_reward_item_id TEXT,
  theme_color TEXT DEFAULT '#a855f7',
  sort_order INT DEFAULT 0
);

ALTER TABLE dungeon_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read dungeons" ON dungeon_definitions FOR SELECT USING (true);
