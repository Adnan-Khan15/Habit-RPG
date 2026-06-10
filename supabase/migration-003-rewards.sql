-- ═══════════════════════════════════════════════════════════════════════════
-- Habit RPG — Migration 003: Remove Stripe, add gold + level-gated rewards
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. DROP STRIPE TABLE ──────────────────────────────────────────────────────
DROP TABLE IF EXISTS stripe_purchases;

-- 2. REMOVE STRIPE COLUMN FROM ITEMS ───────────────────────────────────────
ALTER TABLE items_catalogue DROP COLUMN IF EXISTS stripe_pack_id;

-- 3. ADD LEVEL-GATING COLUMNS ──────────────────────────────────────────────
ALTER TABLE items_catalogue
  ADD COLUMN IF NOT EXISTS unlock_level INT;

-- 4. ADD MILESTONE TRACKING TO PROFILES ────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS rewarded_milestones INT[] DEFAULT '{}';

-- 5. SEED COSMETIC ITEMS WITH PRICES ───────────────────────────────────────
INSERT INTO items_catalogue (id, name, description, slot, rarity, gold_cost, unlock_level, sprite_key) VALUES
  -- Shadow Set — level 10
  ('head_shadow',     'Shadow Helm',      'Dark, menacing helmet from the Shadow Set',  'head',      'rare',      500,  10, 'head_shadow'),
  ('body_shadow',     'Shadow Armour',    'Shadow-infused chestplate',                 'body',      'rare',      500,  10, 'body_shadow'),
  ('weapon_shadow',   'Shadow Blade',     'A blade that drinks the light',             'weapon',    'rare',      500,  10, 'weapon_shadow'),
  ('accessory_shadow','Shadow Amulet',    'Pulsing with dark energy',                  'accessory', 'rare',      500,  10, 'accessory_shadow'),
  -- Celestial Set — level 20
  ('head_celestial',  'Celestial Crown',  'Glowing halo-touched crown',                'head',      'epic',      1000, 20, 'head_celestial'),
  ('body_celestial',  'Celestial Robes',  'Divinely woven celestial robes',            'body',      'epic',      1000, 20, 'body_celestial'),
  ('weapon_celestial','Celestial Staff',  'Staff imbued with holy light',              'weapon',    'epic',      1000, 20, 'weapon_celestial'),
  ('accessory_celestial','Celestial Sigil','Symbol of the ancients',                   'accessory', 'epic',      1000, 20, 'accessory_celestial'),
  -- Dragon Set — level 30
  ('head_dragon',     'Dragon Helm',      'Helm forged from dragon scales',            'head',      'legendary', 2000, 30, 'head_dragon'),
  ('body_dragon',     'Dragon Plate',     'Plate armour of the Dragon Knights',        'body',      'legendary', 2000, 30, 'body_dragon'),
  ('weapon_dragon',   'Dragon Fang',      'Weapon carved from a dragon fang',          'weapon',    'legendary', 2000, 30, 'weapon_dragon'),
  ('accessory_dragon','Dragon Heart',     'Crystallised dragon heart',                 'accessory', 'legendary', 2000, 30, 'accessory_dragon')
ON CONFLICT (id) DO UPDATE SET
  gold_cost    = EXCLUDED.gold_cost,
  unlock_level = EXCLUDED.unlock_level,
  rarity       = EXCLUDED.rarity,
  description  = EXCLUDED.description;

-- 6. CLEAN UP ACQUIRED_VIA CHECK CONSTRAINT ─────────────────────────────────
-- Remove 'stripe' from the enum check since it no longer applies.
ALTER TABLE inventory
  DROP CONSTRAINT IF EXISTS inventory_acquired_via_check;

ALTER TABLE inventory
  ADD CONSTRAINT inventory_acquired_via_check
  CHECK (acquired_via IN ('gold_shop', 'reward', 'referral'));

-- 7. UPDATE EXISTING INVENTORY ROWS ─────────────────────────────────────────
UPDATE inventory SET acquired_via = 'gold_shop' WHERE acquired_via = 'stripe';
