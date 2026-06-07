-- Fix application_pipeline_view to include applicant_id, opportunity_id, startup_id, created_at
CREATE OR REPLACE VIEW application_pipeline_view AS
SELECT
  a.id,
  a.applicant_id,
  a.opportunity_id,
  a.startup_id,
  a.status,
  a.cover_letter,
  a.applied_at,
  a.reviewed_at,
  a.created_at,
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
