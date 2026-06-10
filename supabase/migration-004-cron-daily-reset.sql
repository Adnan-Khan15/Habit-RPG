-- Habit RPG — Migration 004: Cron schedule for daily-reset edge function
-- Run this in Supabase SQL Editor

-- Enable pg_cron extension (one-time setup)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily-reset to run every 30 minutes
-- This catches users with any daily_reset_time setting
SELECT cron.schedule(
  'daily-reset-every-30min',
  '30 * * * *',
  $$SELECT net.http_post(
    url := 'https://nrrphpzrtwbxahnswjlp.supabase.co/functions/v1/daily-reset',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    )
  ) AS request_id$$
);

-- Delete user RPC: used by SettingsPage "Delete Account"
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM profiles WHERE id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
