-- ==============================================================================
-- WIPE ALL DATA SCRIPT
-- ==============================================================================
-- WARNING: This script will delete ALL data from ALL tables in your database
-- including users (from auth.users), profiles, startups, messages, etc.
-- It CANNOT be undone.
-- ==============================================================================

-- 1. Truncate all public tables automatically
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
  LOOP
    EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
  END LOOP;
END $$;

-- 2. Optional: If you also want to delete all authenticated users from Supabase Auth
-- uncomment the following lines. Note that this will log everyone out and force
-- them to sign up again.

-- DELETE FROM auth.users;

-- ==============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project ("AlloySphere")
-- 3. Go to the "SQL Editor" on the left menu
-- 4. Click "New query"
-- 5. Copy and paste this entire script into the editor
-- 6. Click "Run"
-- ==============================================================================
