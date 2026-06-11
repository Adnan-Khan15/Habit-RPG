ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_pet_id TEXT;

CREATE POLICY "Users can update own profile pets" ON profiles
  FOR UPDATE USING (auth.uid() = id);
