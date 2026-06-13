-- =============================================================
-- AlloySphere Migration 00031: Add engagement tables to Realtime
-- =============================================================
-- The startup profile page subscribes to real-time changes on
-- startup_likes, startup_followers, and startup_rankings tables
-- but they were missing from the Realtime publication.
-- =============================================================

-- Recreate publication with all required tables
DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime FOR TABLE
  notifications,
  messages,
  tasks,
  workspace_activity,
  post_comments,
  applications,
  startup_likes,
  startup_followers,
  startup_rankings;
