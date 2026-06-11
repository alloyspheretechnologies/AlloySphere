-- =============================================================
-- AlloySphere Migration 00022: Startup Likes and Rankings
-- =============================================================

-- 1. Startup Likes
CREATE TABLE startup_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(startup_id, user_id)
);

CREATE INDEX idx_startup_likes_startup ON startup_likes(startup_id);
CREATE INDEX idx_startup_likes_user ON startup_likes(user_id);

-- Enable RLS
ALTER TABLE startup_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Likes
CREATE POLICY "Likes are viewable by everyone" ON startup_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON startup_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON startup_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Startup Rankings
CREATE TABLE startup_rankings (
  startup_id uuid PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  score numeric DEFAULT 0,
  rank_position integer,
  updated_at timestamptz DEFAULT now()
);

-- Initialize existing startups into the rankings table
INSERT INTO startup_rankings (startup_id, score)
SELECT id, 0 FROM startups;

-- Add a trigger to add new startups to the rankings table
CREATE OR REPLACE FUNCTION handle_new_startup_ranking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO startup_rankings (startup_id, score) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_startup_created_ranking
  AFTER INSERT ON startups
  FOR EACH ROW EXECUTE FUNCTION handle_new_startup_ranking();

-- 3. Calculate Score Function
-- Formula: (Likes × 2) + (Followers × 3) + (Completeness × 0.5) + (Recent Activity × 2) + (Investor Interest × 5)
CREATE OR REPLACE FUNCTION update_startup_ranking(p_startup_id uuid)
RETURNS void AS $$
DECLARE
  v_likes integer;
  v_followers integer;
  v_completeness numeric;
  v_recent_activity integer;
  v_investor_interest integer;
  v_score numeric;
BEGIN
  -- Get counts
  SELECT count(*) INTO v_likes FROM startup_likes WHERE startup_id = p_startup_id;
  SELECT count(*) INTO v_followers FROM startup_followers WHERE startup_id = p_startup_id;
  
  -- Profile Completeness (mocked as 50-100 depending on fields filled)
  SELECT 
    CASE WHEN name IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN description IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN industry IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN website IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN logo_url IS NOT NULL THEN 20 ELSE 0 END
  INTO v_completeness
  FROM startups WHERE id = p_startup_id;

  -- Recent Activity (Updates within last 30 days)
  SELECT count(*) INTO v_recent_activity 
  FROM startup_updates 
  WHERE startup_id = p_startup_id AND created_at > now() - interval '30 days';

  -- Investor Interest (Bookmarks by investors)
  SELECT count(*) INTO v_investor_interest
  FROM bookmarks b
  JOIN profiles p ON p.id = b.user_id
  WHERE b.entity_type = 'startup' AND b.entity_id = p_startup_id AND p.role = 'investor';

  -- Calculate score
  v_score := (v_likes * 2) + (v_followers * 3) + (v_completeness * 0.5) + (v_recent_activity * 2) + (v_investor_interest * 5);

  -- Update ranking
  UPDATE startup_rankings
  SET score = v_score, updated_at = now()
  WHERE startup_id = p_startup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Triggers to auto-update score on Like/Follow
CREATE OR REPLACE FUNCTION trigger_update_ranking_on_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_startup_ranking(OLD.startup_id);
  ELSE
    PERFORM update_startup_ranking(NEW.startup_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_startup_like_update_ranking
  AFTER INSERT OR DELETE ON startup_likes
  FOR EACH ROW EXECUTE FUNCTION trigger_update_ranking_on_like();

CREATE TRIGGER on_startup_follow_update_ranking
  AFTER INSERT OR DELETE ON startup_followers
  FOR EACH ROW EXECUTE FUNCTION trigger_update_ranking_on_like();
  
-- 5. Helper function to update all rankings and calculate rank_position
CREATE OR REPLACE FUNCTION refresh_all_startup_rankings()
RETURNS void AS $$
BEGIN
  WITH bulk_scores AS (
    SELECT 
      s.id as startup_id,
      (SELECT count(*) FROM startup_likes l WHERE l.startup_id = s.id) * 2 +
      (SELECT count(*) FROM startup_followers f WHERE f.startup_id = s.id) * 3 +
      (
        CASE WHEN s.name IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN s.description IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN s.industry IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN s.website IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN s.logo_url IS NOT NULL THEN 20 ELSE 0 END
      ) * 0.5 +
      (SELECT count(*) FROM startup_updates u WHERE u.startup_id = s.id AND u.created_at > now() - interval '30 days') * 2 +
      (
        SELECT count(*) FROM bookmarks b 
        JOIN profiles p ON p.id = b.user_id 
        WHERE b.entity_type = 'startup' AND b.entity_id = s.id AND p.role = 'investor'
      ) * 5 as new_score
    FROM startups s
  ),
  ranked AS (
    SELECT startup_id, new_score,
           RANK() OVER (ORDER BY new_score DESC) as new_rank
    FROM bulk_scores
  )
  UPDATE startup_rankings r
  SET score = ranked.new_score,
      rank_position = ranked.new_rank,
      updated_at = now()
  FROM ranked
  WHERE r.startup_id = ranked.startup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger ranking refresh once to set initial positions
SELECT refresh_all_startup_rankings();
