-- ═══════════════════════════════════════════════════════════════════════════
-- Habit RPG — Migration 002: Stripe packs, gold RPC, daily targets
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. SAFE GOLD INCREMENT FUNCTION ───────────────────────────────────────────
-- Used by edge functions to atomically add gold to a user.
CREATE OR REPLACE FUNCTION increment_gold(user_id UUID, amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_gold INT;
BEGIN
  UPDATE profiles
  SET gold = gold + amount
  WHERE id = user_id
  RETURNING gold INTO new_gold;
  RETURN new_gold;
END;
$$;

-- 2. DAILY TARGET / PROGRESS COLUMNS ───────────────────────────────────────
-- For habits with a daily quantity target (e.g., "drink 8 glasses of water").
-- daily_target: how many times the user wants to do this per day (NULL = no target).
-- daily_progress: how many times done today (resets at daily reset).
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS daily_target INT,
  ADD COLUMN IF NOT EXISTS daily_progress INT DEFAULT 0;

-- 3. COSMETIC PACK ITEMS ───────────────────────────────────────────────────
-- Shadow Set (dark armour)
INSERT INTO items_catalogue (id, name, description, slot, rarity, gold_cost, stripe_pack_id, sprite_key) VALUES
  ('head_shadow', 'Shadow Helm', 'Dark, menacing helmet from the Shadow Set', 'head', 'rare', NULL, 'shadow_set', 'head_shadow'),
  ('body_shadow', 'Shadow Armour', 'Shadow-infused chestplate', 'body', 'rare', NULL, 'shadow_set', 'body_shadow'),
  ('weapon_shadow', 'Shadow Blade', 'A blade that drinks the light', 'weapon', 'rare', NULL, 'shadow_set', 'weapon_shadow'),
  ('accessory_shadow', 'Shadow Amulet', 'Pulsing with dark energy', 'accessory', 'rare', NULL, 'shadow_set', 'accessory_shadow')
ON CONFLICT (id) DO NOTHING;

-- Celestial Set (angelic / holy)
INSERT INTO items_catalogue (id, name, description, slot, rarity, gold_cost, stripe_pack_id, sprite_key) VALUES
  ('head_celestial', 'Celestial Crown', 'Glowing halo-touched crown', 'head', 'epic', NULL, 'celestial_set', 'head_celestial'),
  ('body_celestial', 'Celestial Robes', 'Divinely woven celestial robes', 'body', 'epic', NULL, 'celestial_set', 'body_celestial'),
  ('weapon_celestial', 'Celestial Staff', 'Staff imbued with holy light', 'weapon', 'epic', NULL, 'celestial_set', 'weapon_celestial'),
  ('accessory_celestial', 'Celestial Sigil', 'Symbol of the ancients', 'accessory', 'epic', NULL, 'celestial_set', 'accessory_celestial')
ON CONFLICT (id) DO NOTHING;

-- Dragon Set (dragon warrior)
INSERT INTO items_catalogue (id, name, description, slot, rarity, gold_cost, stripe_pack_id, sprite_key) VALUES
  ('head_dragon', 'Dragon Helm', 'Helm forged from dragon scales', 'head', 'legendary', NULL, 'dragon_set', 'head_dragon'),
  ('body_dragon', 'Dragon Plate', 'Plate armour of the Dragon Knights', 'body', 'legendary', NULL, 'dragon_set', 'body_dragon'),
  ('weapon_dragon', 'Dragon Fang', 'Weapon carved from a dragon fang', 'weapon', 'legendary', NULL, 'dragon_set', 'weapon_dragon'),
  ('accessory_dragon', 'Dragon Heart', 'Crystallised dragon heart', 'accessory', 'legendary', NULL, 'dragon_set', 'accessory_dragon')
ON CONFLICT (id) DO NOTHING;

-- Starter Bundle items (already seeded in migration 001, just adding stripe_pack_id)
UPDATE items_catalogue SET stripe_pack_id = 'starter_bundle' WHERE id IN ('head_iron', 'body_iron', 'weapon_iron') AND stripe_pack_id IS NULL;
