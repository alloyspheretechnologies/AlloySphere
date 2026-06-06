-- =============================================================
-- AlloySphere Migration 00014: Full-Text Search
-- =============================================================

-- Add search vectors to key tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- GIN indexes for fast full-text search
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);
CREATE INDEX idx_startups_search ON startups USING GIN(search_vector);
CREATE INDEX idx_opportunities_search ON opportunities USING GIN(search_vector);
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- Trigram indexes for fuzzy matching
CREATE INDEX idx_profiles_name_trgm ON profiles USING GIN(name gin_trgm_ops);
CREATE INDEX idx_startups_name_trgm ON startups USING GIN(name gin_trgm_ops);

-- ===== Search Vector Update Functions =====

CREATE OR REPLACE FUNCTION update_profiles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.username, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.headline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.skills, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_search_vector
  BEFORE INSERT OR UPDATE OF name, username, headline, bio, location, skills
  ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_search_vector();

CREATE OR REPLACE FUNCTION update_startups_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_startups_search_vector
  BEFORE INSERT OR UPDATE OF name, industry, description
  ON startups
  FOR EACH ROW EXECUTE FUNCTION update_startups_search_vector();

CREATE OR REPLACE FUNCTION update_opportunities_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.required_skills, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_search_vector
  BEFORE INSERT OR UPDATE OF title, description, required_skills, location
  ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_opportunities_search_vector();

CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_search_vector
  BEFORE INSERT OR UPDATE OF content
  ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_search_vector();

-- ===== Unified Search Function =====

CREATE OR REPLACE FUNCTION search_all(
  search_query text,
  result_limit integer DEFAULT 20
)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  avatar_url text,
  rank real
) AS $$
DECLARE
  tsquery_val tsquery;
BEGIN
  tsquery_val := plainto_tsquery('english', search_query);

  RETURN QUERY
  -- Search profiles
  SELECT
    'profile'::text AS entity_type,
    p.id AS entity_id,
    p.name AS title,
    COALESCE(p.headline, p.role::text) AS subtitle,
    p.avatar_url,
    ts_rank(p.search_vector, tsquery_val) AS rank
  FROM profiles p
  WHERE p.search_vector @@ tsquery_val

  UNION ALL

  -- Search startups
  SELECT
    'startup'::text,
    s.id,
    s.name,
    COALESCE(s.industry, '') || ' • ' || s.stage::text,
    s.logo_url,
    ts_rank(s.search_vector, tsquery_val)
  FROM startups s
  WHERE s.search_vector @@ tsquery_val
    AND s.visibility = 'public'

  UNION ALL

  -- Search opportunities
  SELECT
    'opportunity'::text,
    o.id,
    o.title,
    COALESCE(o.location, 'Remote') || ' • ' || o.commitment::text,
    NULL,
    ts_rank(o.search_vector, tsquery_val)
  FROM opportunities o
  WHERE o.search_vector @@ tsquery_val
    AND o.status = 'open'

  UNION ALL

  -- Search posts
  SELECT
    'post'::text,
    po.id,
    LEFT(po.content, 100),
    'Post by ' || (SELECT name FROM profiles WHERE id = po.author_id),
    NULL,
    ts_rank(po.search_vector, tsquery_val)
  FROM posts po
  WHERE po.search_vector @@ tsquery_val

  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;
