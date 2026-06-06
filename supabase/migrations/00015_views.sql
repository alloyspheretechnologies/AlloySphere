-- =============================================================
-- AlloySphere Migration 00015: Database Views
-- =============================================================

-- Startup Dashboard View (aggregated metrics)
CREATE OR REPLACE VIEW startup_dashboard_view AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.industry,
  s.stage,
  s.status,
  s.team_size,
  s.logo_url,
  s.owner_id,
  s.created_at,
  (SELECT COUNT(*) FROM startup_members sm WHERE sm.startup_id = s.id AND sm.status = 'active') AS active_members,
  (SELECT COUNT(*) FROM startup_followers sf WHERE sf.startup_id = s.id) AS followers_count,
  (SELECT COUNT(*) FROM opportunities o WHERE o.startup_id = s.id AND o.status = 'open') AS open_opportunities,
  (SELECT COUNT(*) FROM applications a WHERE a.startup_id = s.id) AS total_applications,
  (SELECT COUNT(*) FROM applications a WHERE a.startup_id = s.id AND a.status = 'applied') AS pending_applications,
  w.id AS workspace_id,
  (SELECT COUNT(*) FROM tasks t WHERE t.workspace_id = w.id) AS total_tasks,
  (SELECT COUNT(*) FROM tasks t WHERE t.workspace_id = w.id AND t.status = 'done') AS completed_tasks,
  (SELECT COUNT(*) FROM projects p WHERE p.workspace_id = w.id) AS total_projects
FROM startups s
LEFT JOIN workspaces w ON w.startup_id = s.id;

-- Opportunity Listing View (with startup info)
CREATE OR REPLACE VIEW opportunity_listing_view AS
SELECT
  o.*,
  s.name AS startup_name,
  s.slug AS startup_slug,
  s.logo_url AS startup_logo,
  s.industry AS startup_industry,
  s.stage AS startup_stage
FROM opportunities o
JOIN startups s ON s.id = o.startup_id;

-- Workspace Overview View
CREATE OR REPLACE VIEW workspace_overview_view AS
SELECT
  w.id,
  w.name,
  w.startup_id,
  s.name AS startup_name,
  s.slug AS startup_slug,
  (SELECT COUNT(*) FROM projects p WHERE p.workspace_id = w.id) AS project_count,
  (SELECT COUNT(*) FROM tasks t WHERE t.workspace_id = w.id) AS task_count,
  (SELECT COUNT(*) FROM tasks t WHERE t.workspace_id = w.id AND t.status = 'done') AS completed_task_count,
  (SELECT COUNT(*) FROM documents d WHERE d.workspace_id = w.id) AS document_count,
  (SELECT COUNT(*) FROM startup_members sm WHERE sm.startup_id = w.startup_id AND sm.status = 'active') AS member_count
FROM workspaces w
JOIN startups s ON s.id = w.startup_id;

-- User Feed View (posts with author info)
CREATE OR REPLACE VIEW user_feed_view AS
SELECT
  p.id,
  p.type,
  p.content,
  p.media_urls,
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

-- Application Pipeline View
CREATE OR REPLACE VIEW application_pipeline_view AS
SELECT
  a.id,
  a.status,
  a.cover_letter,
  a.applied_at,
  a.reviewed_at,
  o.title AS opportunity_title,
  o.commitment,
  o.location,
  s.name AS startup_name,
  s.logo_url AS startup_logo,
  s.slug AS startup_slug,
  p.name AS applicant_name,
  p.avatar_url AS applicant_avatar,
  p.headline AS applicant_headline,
  p.skills AS applicant_skills
FROM applications a
JOIN opportunities o ON o.id = a.opportunity_id
JOIN startups s ON s.id = a.startup_id
JOIN profiles p ON p.id = a.applicant_id;
