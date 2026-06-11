CREATE TABLE IF NOT EXISTS tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] DEFAULT '{}',
  skipped BOOL DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tutorial" ON tutorial_progress FOR ALL USING (auth.uid() = user_id);
