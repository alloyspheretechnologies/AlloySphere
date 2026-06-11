-- =============================================================
-- AlloySphere Migration 00020: Post Enhancements (Rich Media & Documents)
-- =============================================================

-- Add new enum values to post_type if they don't exist
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'general_update';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'product_launch';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'funding_update';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'team_update';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'investor_update';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'document_share';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'media_gallery';

-- Drop the view first because it depends on the posts table columns
DROP VIEW IF EXISTS user_feed_view;

-- Add attachments column to posts to support document uploads
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments jsonb[] DEFAULT '{}';

-- Recreate the user_feed_view to include attachments
CREATE OR REPLACE VIEW user_feed_view AS
SELECT
  p.id,
  p.type,
  p.content,
  p.media_urls,
  p.attachments,
  p.likes_count,
  p.comments_count,
  p.created_at,
  p.updated_at,
  pr.id AS author_profile_id,
  pr.name AS author_name,
  pr.username AS author_username,
  pr.avatar_url AS author_avatar,
  pr.headline AS author_headline,
  s.id AS startup_id,
  s.name AS startup_name,
  s.logo_url AS startup_logo
FROM posts p
JOIN profiles pr ON pr.id = p.author_id
LEFT JOIN startups s ON s.id = p.startup_id
ORDER BY p.created_at DESC;
