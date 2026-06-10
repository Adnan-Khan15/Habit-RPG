-- ═══════════════════════════════════════════════════════════════════════════
-- Habit RPG — Migration 006: Explicit INSERT RLS policies
-- FOR ALL USING does not reliably grant INSERT in all PostgreSQL versions.
-- These explicit policies ensure client-side inserts work correctly.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. TASKS
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. HABIT STREAKS
DROP POLICY IF EXISTS "Users can insert own habit streaks" ON habit_streaks;
CREATE POLICY "Users can insert own habit streaks" ON habit_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. INVENTORY
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory;
CREATE POLICY "Users can insert own inventory" ON inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. EQUIPPED GEAR
DROP POLICY IF EXISTS "Users can insert own equipped gear" ON equipped_gear;
CREATE POLICY "Users can insert own equipped gear" ON equipped_gear
  FOR INSERT WITH CHECK (auth.uid() = user_id);
