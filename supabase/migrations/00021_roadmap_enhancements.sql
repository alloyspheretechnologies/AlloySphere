-- =============================================================
-- AlloySphere Migration 00021: Roadmap Enhancements
-- =============================================================

-- Enhance roadmaps table with new columns for comprehensive tracking
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS status text DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_track', 'at_risk', 'completed', 'archived'));
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS target_date date;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'team' CHECK (visibility IN ('public', 'private', 'team'));
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_roadmaps_owner ON roadmaps(owner_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON roadmaps(status);

-- Link milestones to roadmaps
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_milestones_roadmap ON milestones(roadmap_id);

-- Optional: Link projects to roadmaps
ALTER TABLE projects ADD COLUMN IF NOT EXISTS roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_roadmap ON projects(roadmap_id);
