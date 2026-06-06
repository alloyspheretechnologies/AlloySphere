-- =============================================================
-- AlloySphere Migration 00003: Startups, Members & Related
-- =============================================================

-- Startups
CREATE TABLE startups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  industry      text,
  stage         startup_stage DEFAULT 'idea',
  description   text,
  website       text,
  logo_url      text,
  cover_image   text,
  status        startup_status DEFAULT 'active',
  team_size     integer DEFAULT 1,
  visibility    startup_visibility DEFAULT 'public',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_startups_owner     ON startups(owner_id);
CREATE INDEX idx_startups_slug      ON startups(slug);
CREATE INDEX idx_startups_stage     ON startups(stage);
CREATE INDEX idx_startups_status    ON startups(status);
CREATE INDEX idx_startups_industry  ON startups(industry);

CREATE TRIGGER trg_startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Startup Members
CREATE TABLE startup_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          member_role DEFAULT 'member',
  status        member_status DEFAULT 'active',
  permissions   jsonb DEFAULT '{}',
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(startup_id, user_id)
);

CREATE INDEX idx_startup_members_startup ON startup_members(startup_id);
CREATE INDEX idx_startup_members_user    ON startup_members(user_id);

-- Startup Roles (positions within a startup)
CREATE TABLE startup_roles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  is_filled     boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_startup_roles_startup ON startup_roles(startup_id);

-- Startup Followers
CREATE TABLE startup_followers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(startup_id, user_id)
);

CREATE INDEX idx_startup_followers_startup ON startup_followers(startup_id);
CREATE INDEX idx_startup_followers_user    ON startup_followers(user_id);

-- Startup Updates (news/progress updates)
CREATE TABLE startup_updates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  content       text,
  update_type   text DEFAULT 'general',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_startup_updates_startup ON startup_updates(startup_id);

-- Auto-add owner as member when startup is created
CREATE OR REPLACE FUNCTION handle_startup_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO startup_members (startup_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_startup_created
  AFTER INSERT ON startups
  FOR EACH ROW EXECUTE FUNCTION handle_startup_created();
