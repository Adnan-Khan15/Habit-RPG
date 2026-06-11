CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INT CHECK (mood >= 1 AND mood <= 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);
