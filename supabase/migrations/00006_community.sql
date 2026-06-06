-- =============================================================
-- AlloySphere Migration 00006: Community Feed
-- =============================================================

-- Posts
CREATE TABLE posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  startup_id      uuid REFERENCES startups(id) ON DELETE SET NULL,
  type            post_type DEFAULT 'text',
  content         text NOT NULL,
  media_urls      text[] DEFAULT '{}',
  likes_count     integer DEFAULT 0,
  comments_count  integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_posts_author    ON posts(author_id);
CREATE INDEX idx_posts_startup   ON posts(startup_id);
CREATE INDEX idx_posts_type      ON posts(type);
CREATE INDEX idx_posts_created   ON posts(created_at DESC);

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Post Likes
CREATE TABLE post_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- Auto-update likes_count
CREATE OR REPLACE FUNCTION handle_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_post_like_insert
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION handle_post_like_count();

CREATE TRIGGER trg_post_like_delete
  AFTER DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION handle_post_like_count();

-- Post Comments
CREATE TABLE post_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  parent_id   uuid REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_post_comments_post    ON post_comments(post_id);
CREATE INDEX idx_post_comments_author  ON post_comments(author_id);
CREATE INDEX idx_post_comments_parent  ON post_comments(parent_id);

CREATE TRIGGER trg_post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-update comments_count
CREATE OR REPLACE FUNCTION handle_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_post_comment_insert
  AFTER INSERT ON post_comments
  FOR EACH ROW EXECUTE FUNCTION handle_post_comment_count();

CREATE TRIGGER trg_post_comment_delete
  AFTER DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION handle_post_comment_count();
