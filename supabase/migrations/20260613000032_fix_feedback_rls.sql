-- =============================================================
-- AlloySphere Migration 00032: Fix feedback RLS policies
-- =============================================================
-- The original INSERT policy on platform_feedback was missing
-- the TO authenticated clause, which may cause it to not apply
-- correctly for authenticated users.
-- =============================================================

-- Drop and recreate the INSERT policy with explicit role
DROP POLICY IF EXISTS "Users can insert their own feedback" ON platform_feedback;

CREATE POLICY "Users can insert their own feedback"
  ON platform_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
