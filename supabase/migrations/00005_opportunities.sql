-- =============================================================
-- AlloySphere Migration 00005: Opportunities & Applications
-- =============================================================

-- Opportunities (job/role postings by startups)
CREATE TABLE opportunities (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id        uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title             text NOT NULL,
  description       text,
  required_skills   text[] DEFAULT '{}',
  commitment        opportunity_type DEFAULT 'full_time',
  location          text DEFAULT 'Remote',
  experience_level  text,
  equity_range      text,
  status            text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paused')),
  applications_count integer DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_opportunities_startup   ON opportunities(startup_id);
CREATE INDEX idx_opportunities_status    ON opportunities(status);
CREATE INDEX idx_opportunities_skills    ON opportunities USING GIN(required_skills);
CREATE INDEX idx_opportunities_commitment ON opportunities(commitment);

CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Applications
CREATE TABLE applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  applicant_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  startup_id      uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  status          application_status DEFAULT 'applied',
  cover_letter    text,
  resume_url      text,
  metadata        jsonb DEFAULT '{}',
  applied_at      timestamptz DEFAULT now(),
  reviewed_at     timestamptz,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(opportunity_id, applicant_id)
);

CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_applicant   ON applications(applicant_id);
CREATE INDEX idx_applications_startup     ON applications(startup_id);
CREATE INDEX idx_applications_status      ON applications(status);

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-increment applications_count on new application
CREATE OR REPLACE FUNCTION handle_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE opportunities SET applications_count = applications_count + 1
    WHERE id = NEW.opportunity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE opportunities SET applications_count = GREATEST(applications_count - 1, 0)
    WHERE id = OLD.opportunity_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_application_count_insert
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_count();

CREATE TRIGGER trg_application_count_delete
  AFTER DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_count();
