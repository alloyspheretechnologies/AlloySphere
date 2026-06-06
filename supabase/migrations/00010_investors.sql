-- =============================================================
-- AlloySphere Migration 00010: Investor Profiles & Pipeline
-- =============================================================

-- Extended Investor Profiles
CREATE TABLE investor_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  firm_name             text,
  investment_thesis     text,
  check_size_min        numeric(12,2),
  check_size_max        numeric(12,2),
  preferred_stages      startup_stage[] DEFAULT '{}',
  preferred_industries  text[] DEFAULT '{}',
  portfolio_count       integer DEFAULT 0,
  website               text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX idx_investor_profiles_user ON investor_profiles(user_id);
CREATE INDEX idx_investor_stages        ON investor_profiles USING GIN(preferred_stages);
CREATE INDEX idx_investor_industries    ON investor_profiles USING GIN(preferred_industries);

CREATE TRIGGER trg_investor_profiles_updated_at
  BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Saved/Bookmarked Startups (by investors or anyone)
CREATE TABLE saved_startups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  startup_id  uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, startup_id)
);

CREATE INDEX idx_saved_startups_user    ON saved_startups(user_id);
CREATE INDEX idx_saved_startups_startup ON saved_startups(startup_id);

-- Saved Opportunities
CREATE TABLE saved_opportunities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id  uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX idx_saved_opps_user ON saved_opportunities(user_id);
CREATE INDEX idx_saved_opps_opp  ON saved_opportunities(opportunity_id);
