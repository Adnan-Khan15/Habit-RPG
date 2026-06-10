-- ═══════════════════════════════════════════════════════════════════════════
-- Habit RPG — Migration 005: xp_boost_until column + inventory unique constraint
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add xp_boost_until to profiles (persists XP boost across page reloads)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp_boost_until TIMESTAMPTZ;

-- 2. Add UNIQUE constraint to inventory (required for claimMilestoneRewards upsert)
ALTER TABLE inventory
  DROP CONSTRAINT IF EXISTS inventory_user_item_unique;

ALTER TABLE inventory
  ADD CONSTRAINT inventory_user_item_unique UNIQUE (user_id, item_id);
