-- =============================================================
-- AlloySphere Migration 00019: Realtime Configuration
-- =============================================================

-- Enable realtime for specific tables
-- Supabase Realtime uses publications to determine which tables to broadcast

-- Drop default publication if exists and recreate with our tables
DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime FOR TABLE
  notifications,
  messages,
  tasks,
  workspace_activity,
  post_comments,
  applications;

-- Note: After applying this migration, you also need to enable
-- Realtime in the Supabase Dashboard for each table:
-- Database → Replication → supabase_realtime publication
--
-- Clients subscribe via:
--   supabase.channel('notifications').on('postgres_changes', ...)
--
-- Supported events: INSERT, UPDATE, DELETE
-- Filters can be applied per-channel for row-level filtering
