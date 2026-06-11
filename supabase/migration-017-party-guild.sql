CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  max_members INT DEFAULT 5,
  is_public BOOL DEFAULT true,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(party_id, user_id)
);

CREATE TABLE IF NOT EXISTS party_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES profiles(id) NOT NULL,
  to_user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read parties" ON parties FOR SELECT USING (true);
CREATE POLICY "Users can create parties" ON parties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Party owners can update" ON parties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can read own party memberships" ON party_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own invites" ON party_invites FOR ALL USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);
