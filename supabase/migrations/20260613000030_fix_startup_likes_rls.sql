-- =============================================================
-- AlloySphere Migration 00030: Fix Startup Likes RLS Policies
-- =============================================================
-- The original RLS policies on startup_likes used auth.uid()
-- directly, but startup_likes.user_id references profiles(id)
-- which is a separate UUID from auth.users(id).
-- This migration fixes the policies to use auth_profile_id()
-- which correctly maps auth.uid() -> profiles.id.
-- =============================================================

-- Drop the broken policies
DROP POLICY IF EXISTS "Users can insert their own likes" ON startup_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON startup_likes;

-- Recreate with correct auth_profile_id() check
CREATE POLICY "Users can insert their own likes" ON startup_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "Users can delete their own likes" ON startup_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());
