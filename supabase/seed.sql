-- =============================================================
-- AlloySphere Seed Data — Demo-Ready Dataset
-- =============================================================
-- This seed data creates a fully functional demo environment.
-- Run after all migrations: supabase db reset (applies migrations + seed)
-- =============================================================

-- NOTE: Since profiles are auto-created via auth.users trigger,
-- we seed profiles directly for demo purposes using the service role.
-- In production, profiles are created automatically on signup.

-- ===== SKILLS CATALOG =====
INSERT INTO skills (id, name, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'React', 'Frontend'),
  ('00000000-0000-0000-0000-000000000002', 'TypeScript', 'Frontend'),
  ('00000000-0000-0000-0000-000000000003', 'Next.js', 'Frontend'),
  ('00000000-0000-0000-0000-000000000004', 'Node.js', 'Backend'),
  ('00000000-0000-0000-0000-000000000005', 'PostgreSQL', 'Database'),
  ('00000000-0000-0000-0000-000000000006', 'Python', 'Backend'),
  ('00000000-0000-0000-0000-000000000007', 'Machine Learning', 'AI'),
  ('00000000-0000-0000-0000-000000000008', 'UI/UX Design', 'Design'),
  ('00000000-0000-0000-0000-000000000009', 'Figma', 'Design'),
  ('00000000-0000-0000-0000-000000000010', 'Product Management', 'Business'),
  ('00000000-0000-0000-0000-000000000011', 'Data Science', 'AI'),
  ('00000000-0000-0000-0000-000000000012', 'DevOps', 'Infrastructure'),
  ('00000000-0000-0000-0000-000000000013', 'AWS', 'Infrastructure'),
  ('00000000-0000-0000-0000-000000000014', 'Go', 'Backend'),
  ('00000000-0000-0000-0000-000000000015', 'Rust', 'Backend'),
  ('00000000-0000-0000-0000-000000000016', 'Swift', 'Mobile'),
  ('00000000-0000-0000-0000-000000000017', 'Kotlin', 'Mobile'),
  ('00000000-0000-0000-0000-000000000018', 'Flutter', 'Mobile'),
  ('00000000-0000-0000-0000-000000000019', 'Blockchain', 'Web3'),
  ('00000000-0000-0000-0000-000000000020', 'Growth Marketing', 'Business')
ON CONFLICT (id) DO NOTHING;

-- ===== BADGES =====
INSERT INTO badges (id, name, description, icon_url) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Early Adopter', 'Joined during the beta phase', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Startup Launcher', 'Created their first startup', NULL),
  ('b0000000-0000-0000-0000-000000000003', 'Team Builder', 'Invited 5+ team members', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'Task Machine', 'Completed 50+ tasks', NULL),
  ('b0000000-0000-0000-0000-000000000005', 'Community Star', 'Received 100+ post likes', NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== ACHIEVEMENTS =====
INSERT INTO achievements (id, name, description, points, badge_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'First Login', 'Logged in for the first time', 10, 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000002', 'Profile Complete', 'Filled out entire profile', 25, NULL),
  ('a0000000-0000-0000-0000-000000000003', 'First Startup', 'Created a startup', 50, 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000004', 'First Application', 'Submitted first job application', 15, NULL),
  ('a0000000-0000-0000-0000-000000000005', 'Networker', 'Made 10 connections', 30, NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== DEMO PROFILES =====
-- These are seeded directly; in production, created via auth trigger.
-- Using deterministic UUIDs so foreign keys work.

INSERT INTO profiles (id, user_id, role, name, username, bio, headline, avatar_url, location, skills, onboarding_complete) VALUES
  -- Founders
  ('11111111-1111-1111-1111-111111111111',
   '11111111-aaaa-aaaa-aaaa-111111111111',
   'founder', 'David Chen', 'davidchen',
   'Serial entrepreneur building the future of startup collaboration. Previously founded 2 successful SaaS companies.',
   'Founder & CEO @ AlloySphere',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
   'San Francisco, CA', ARRAY['Product Management', 'Full Stack', 'Leadership'], true),

  ('11111111-1111-1111-1111-222222222222',
   '11111111-aaaa-aaaa-aaaa-222222222222',
   'founder', 'Priya Sharma', 'priyasharma',
   'Healthcare AI entrepreneur passionate about making medical diagnostics accessible globally.',
   'Founder @ MedVision AI',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
   'Boston, MA', ARRAY['AI', 'Healthcare', 'Python'], true),

  -- Talent
  ('11111111-1111-1111-1111-333333333333',
   '11111111-aaaa-aaaa-aaaa-333333333333',
   'talent', 'Marcus King', 'marcusking',
   'Full-stack engineer specializing in React, Next.js, and real-time systems. Open to exciting startup opportunities.',
   'Senior Full-Stack Engineer',
   NULL,
   'Austin, TX', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], true),

  ('11111111-1111-1111-1111-444444444444',
   '11111111-aaaa-aaaa-aaaa-444444444444',
   'talent', 'Sarah Jenkins', 'sarahjenkins',
   'Award-winning product designer with 8 years of experience in SaaS and mobile applications.',
   'Lead Product Designer',
   'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces',
   'New York, NY', ARRAY['UI/UX Design', 'Figma', 'Product Management'], true),

  -- Investor
  ('11111111-1111-1111-1111-555555555555',
   '11111111-aaaa-aaaa-aaaa-555555555555',
   'investor', 'Alex Rivera', 'alexrivera',
   'Seed-stage investor focused on AI, SaaS, and developer tools. GP at Velocity Ventures.',
   'General Partner @ Velocity Ventures',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
   'Palo Alto, CA', ARRAY['Venture Capital', 'AI', 'SaaS'], true),

  -- Admin
  ('11111111-1111-1111-1111-666666666666',
   '11111111-aaaa-aaaa-aaaa-666666666666',
   'admin', 'System Admin', 'admin',
   'AlloySphere platform administrator.',
   'Platform Admin',
   NULL, 'Remote', ARRAY[]::text[], true)
ON CONFLICT (id) DO NOTHING;

-- ===== STARTUPS =====
INSERT INTO startups (id, owner_id, name, slug, industry, stage, description, website, status, team_size, visibility) VALUES
  ('22222222-2222-2222-2222-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'AlloySphere', 'alloysphere',
   'Startup Ecosystem', 'mvp',
   'The Startup Operating System. A holographic command center for founders, talent, and investors to build, collaborate, and grow together.',
   'https://alloysphere.com', 'active', 12, 'public'),

  ('22222222-2222-2222-2222-222222222222',
   '11111111-1111-1111-1111-111111111111',
   'CollabHub', 'collabhub',
   'SaaS', 'series_a',
   'Real-time collaboration platform for distributed teams. Video, chat, task management, and AI-powered meeting summaries.',
   'https://collabhub.io', 'active', 45, 'public'),

  ('22222222-2222-2222-2222-333333333333',
   '11111111-1111-1111-1111-222222222222',
   'MedVision', 'medvision',
   'HealthTech', 'seed',
   'AI-powered medical imaging diagnostics platform. Making radiology analysis 10x faster and more accessible.',
   'https://medvision.ai', 'active', 8, 'public')
ON CONFLICT (id) DO NOTHING;

-- ===== WORKSPACES (auto-created by trigger, but we insert manually for seed) =====
INSERT INTO workspaces (id, startup_id, name) VALUES
  ('33333333-3333-3333-3333-111111111111', '22222222-2222-2222-2222-111111111111', 'AlloySphere Workspace'),
  ('33333333-3333-3333-3333-222222222222', '22222222-2222-2222-2222-222222222222', 'CollabHub Workspace'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-333333333333', 'MedVision Workspace')
ON CONFLICT (id) DO NOTHING;

-- ===== STARTUP MEMBERS =====
INSERT INTO startup_members (startup_id, user_id, role, status) VALUES
  -- AlloySphere team
  ('22222222-2222-2222-2222-111111111111', '11111111-1111-1111-1111-111111111111', 'owner', 'active'),
  ('22222222-2222-2222-2222-111111111111', '11111111-1111-1111-1111-333333333333', 'member', 'active'),
  ('22222222-2222-2222-2222-111111111111', '11111111-1111-1111-1111-444444444444', 'member', 'active'),
  -- CollabHub team
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'owner', 'active'),
  -- MedVision team
  ('22222222-2222-2222-2222-333333333333', '11111111-1111-1111-1111-222222222222', 'owner', 'active')
ON CONFLICT (startup_id, user_id) DO NOTHING;

-- ===== PROJECTS =====
INSERT INTO projects (id, workspace_id, name, description, status, progress, created_by) VALUES
  ('44444444-4444-4444-4444-111111111111', '33333333-3333-3333-3333-111111111111', 'MVP Launch', 'Ship the AlloySphere MVP to early adopters', 'in_progress', 75, '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-222222222222', '33333333-3333-3333-3333-111111111111', 'Seed Fundraising Deck', 'Prepare pitch materials for seed round', 'planning', 20, '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-333333333333', '33333333-3333-3333-3333-111111111111', 'Marketing Website v2', 'Redesign and relaunch the marketing site', 'completed', 100, '11111111-1111-1111-1111-444444444444'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-222222222222', 'AI Meeting Summaries', 'Build AI-powered meeting summary feature', 'in_progress', 40, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ===== TASKS =====
INSERT INTO tasks (id, project_id, workspace_id, title, description, status, priority, assignee_id, reporter_id, tags, position) VALUES
  -- AlloySphere tasks
  ('55555555-5555-5555-5555-111111111111', '44444444-4444-4444-4444-111111111111', '33333333-3333-3333-3333-111111111111', 'Implement new holographic workspace table', 'Build the holographic round table UI with avatar positioning', 'in_progress', 'high', '11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', ARRAY['Frontend', 'UI'], 0),
  ('55555555-5555-5555-5555-222222222222', '44444444-4444-4444-4444-111111111111', '33333333-3333-3333-3333-111111111111', 'Finalize mobile responsive layouts for profile', 'Ensure all profile pages are fully responsive', 'in_progress', 'medium', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-111111111111', ARRAY['Design', 'Mobile'], 1),
  ('55555555-5555-5555-5555-333333333333', '44444444-4444-4444-4444-111111111111', '33333333-3333-3333-3333-111111111111', 'Review Series A pitch deck', 'Review and provide feedback on pitch deck draft', 'todo', 'high', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', ARRAY['Business'], 0),
  ('55555555-5555-5555-5555-444444444444', '44444444-4444-4444-4444-111111111111', '33333333-3333-3333-3333-111111111111', 'Set up Supabase backend infrastructure', 'Configure database, auth, storage, and RLS', 'done', 'urgent', '11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', ARRAY['Backend', 'DevOps'], 0),
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-111111111111', '33333333-3333-3333-3333-111111111111', 'Design investor dashboard wireframes', 'Create low-fi wireframes for investor view', 'done', 'medium', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-111111111111', ARRAY['Design'], 1),
  ('55555555-5555-5555-5555-666666666666', NULL, '33333333-3333-3333-3333-111111111111', 'Finalize brand guidelines v2', 'Update color palette, typography, and component library', 'todo', 'low', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-111111111111', ARRAY['Design', 'Branding'], 1),
  ('55555555-5555-5555-5555-777777777777', NULL, '33333333-3333-3333-3333-111111111111', 'Write API documentation', 'Document all service layer APIs', 'todo', 'medium', '11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', ARRAY['Docs'], 2)
ON CONFLICT (id) DO NOTHING;

-- ===== MILESTONES =====
INSERT INTO milestones (id, project_id, title, description, target_date, status) VALUES
  ('66666666-6666-6666-6666-111111111111', '44444444-4444-4444-4444-111111111111', 'Alpha Release', 'Internal team testing release', '2026-06-15', 'completed'),
  ('66666666-6666-6666-6666-222222222222', '44444444-4444-4444-4444-111111111111', 'Beta Launch', 'Launch to 100 beta users', '2026-07-01', 'in_progress'),
  ('66666666-6666-6666-6666-333333333333', '44444444-4444-4444-4444-111111111111', 'Public Launch', 'Open to all users', '2026-08-01', 'pending')
ON CONFLICT (id) DO NOTHING;

-- ===== OPPORTUNITIES =====
INSERT INTO opportunities (id, startup_id, title, description, required_skills, commitment, location, experience_level, equity_range, status) VALUES
  ('77777777-7777-7777-7777-111111111111', '22222222-2222-2222-2222-111111111111', 'Senior Product Designer', 'Design the next generation of our holographic workspace UI. You will own the entire design system.', ARRAY['UI/UX Design', 'Figma', 'Design Systems'], 'full_time', 'Remote', 'Senior (5+ years)', '0.5-1.0%', 'open'),
  ('77777777-7777-7777-7777-222222222222', '22222222-2222-2222-2222-111111111111', 'Full-Stack Engineer', 'Build real-time collaborative features using Next.js, Supabase, and WebRTC.', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], 'full_time', 'Remote', 'Mid-Senior (3+ years)', '0.25-0.75%', 'open'),
  ('77777777-7777-7777-7777-333333333333', '22222222-2222-2222-2222-222222222222', 'AI/ML Engineer', 'Develop AI models for real-time meeting transcription and summarization.', ARRAY['Python', 'Machine Learning', 'NLP'], 'full_time', 'San Francisco, CA', 'Senior (5+ years)', '0.1-0.3%', 'open'),
  ('77777777-7777-7777-7777-444444444444', '22222222-2222-2222-2222-333333333333', 'Frontend Developer', 'Build the medical imaging viewer and diagnostic dashboard.', ARRAY['React', 'TypeScript', 'WebGL'], 'contract', 'Remote', 'Mid (2+ years)', 'Negotiable', 'open'),
  ('77777777-7777-7777-7777-555555555555', '22222222-2222-2222-2222-333333333333', 'Data Scientist', 'Train and optimize computer vision models for radiology analysis.', ARRAY['Python', 'Data Science', 'Computer Vision'], 'full_time', 'Boston, MA', 'Senior (5+ years)', '1.0-2.0%', 'open')
ON CONFLICT (id) DO NOTHING;

-- ===== APPLICATIONS =====
INSERT INTO applications (id, opportunity_id, applicant_id, startup_id, status, cover_letter) VALUES
  ('88888888-8888-8888-8888-111111111111', '77777777-7777-7777-7777-111111111111', '11111111-1111-1111-1111-444444444444', '22222222-2222-2222-2222-111111111111', 'accepted', 'I am excited to bring my 8 years of design experience to AlloySphere. The holographic workspace concept is brilliant.'),
  ('88888888-8888-8888-8888-222222222222', '77777777-7777-7777-7777-222222222222', '11111111-1111-1111-1111-333333333333', '22222222-2222-2222-2222-111111111111', 'accepted', 'Full-stack engineer with deep expertise in React and real-time systems. Built similar collaborative tools before.'),
  ('88888888-8888-8888-8888-333333333333', '77777777-7777-7777-7777-333333333333', '11111111-1111-1111-1111-333333333333', '22222222-2222-2222-2222-222222222222', 'reviewing', 'Interested in applying my backend skills to AI/ML infrastructure.'),
  ('88888888-8888-8888-8888-444444444444', '77777777-7777-7777-7777-444444444444', '11111111-1111-1111-1111-333333333333', '22222222-2222-2222-2222-333333333333', 'applied', 'Would love to contribute to healthcare innovation through frontend development.')
ON CONFLICT (opportunity_id, applicant_id) DO NOTHING;

-- ===== POSTS (Community Feed) =====
INSERT INTO posts (id, author_id, startup_id, type, content, likes_count, comments_count) VALUES
  ('99999999-9999-9999-9999-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-111111111111', 'milestone', '🚀 Huge milestone for AlloySphere! We just shipped our holographic workspace MVP. The future of startup collaboration is here. #BuildInPublic #StartupOS', 24, 5),
  ('99999999-9999-9999-9999-222222222222', '11111111-1111-1111-1111-222222222222', '22222222-2222-2222-2222-333333333333', 'update', '📊 MedVision just completed our first clinical trial partnership with Boston General Hospital. AI diagnostics are 94% accurate on initial results.', 18, 3),
  ('99999999-9999-9999-9999-333333333333', '11111111-1111-1111-1111-333333333333', NULL, 'text', 'Hot take: The best startup tool is the one that gets out of your way. After trying 20+ project management tools, the winner is simplicity. Less features, more flow. 🎯', 31, 8),
  ('99999999-9999-9999-9999-444444444444', '11111111-1111-1111-1111-444444444444', NULL, 'text', 'Just wrapped up a complete design system overhaul. New glassmorphism components, holographic effects, and a custom icon set. Feeling inspired! ✨', 42, 6),
  ('99999999-9999-9999-9999-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'announcement', '🎉 CollabHub just crossed 10,000 active users! From a weekend hackathon project to Series A — what a journey. Grateful for this incredible team.', 56, 12)
ON CONFLICT (id) DO NOTHING;

-- ===== POST COMMENTS =====
INSERT INTO post_comments (post_id, author_id, content) VALUES
  ('99999999-9999-9999-9999-111111111111', '11111111-1111-1111-1111-333333333333', 'This is incredible! The holographic workspace is mind-blowing 🔥'),
  ('99999999-9999-9999-9999-111111111111', '11111111-1111-1111-1111-555555555555', 'Very impressive execution. Would love to chat about investment opportunities.'),
  ('99999999-9999-9999-9999-222222222222', '11111111-1111-1111-1111-555555555555', '94% accuracy is exceptional for early-stage. Following closely.'),
  ('99999999-9999-9999-9999-333333333333', '11111111-1111-1111-1111-444444444444', '100% agree. We need tools that enhance focus, not fragment it.'),
  ('99999999-9999-9999-9999-555555555555', '11111111-1111-1111-1111-222222222222', 'Congrats David! Amazing achievement. 🎉');

-- ===== INVESTOR PROFILE =====
INSERT INTO investor_profiles (id, user_id, firm_name, investment_thesis, check_size_min, check_size_max, preferred_stages, preferred_industries, portfolio_count, website) VALUES
  ('aa000000-0000-0000-0000-111111111111', '11111111-1111-1111-1111-555555555555', 'Velocity Ventures', 'We invest in technical founders building AI-powered developer and enterprise tools. Pre-seed to Seed stage, $100K-$2M checks.', 100000, 2000000, ARRAY['mvp', 'seed']::startup_stage[], ARRAY['AI', 'SaaS', 'Developer Tools', 'Enterprise'], 24, 'https://velocity.vc')
ON CONFLICT (id) DO NOTHING;

-- ===== SAVED STARTUPS (by investor) =====
INSERT INTO saved_startups (user_id, startup_id, notes) VALUES
  ('11111111-1111-1111-1111-555555555555', '22222222-2222-2222-2222-111111111111', 'Very promising team and product. Unique approach to startup collaboration. Watch closely for traction metrics.'),
  ('11111111-1111-1111-1111-555555555555', '22222222-2222-2222-2222-333333333333', 'Strong clinical validation. Need to see business model clarity.')
ON CONFLICT (user_id, startup_id) DO NOTHING;

-- ===== CONVERSATIONS & MESSAGES =====
INSERT INTO conversations (id, type, created_by, last_message_at) VALUES
  ('cc000000-0000-0000-0000-111111111111', 'direct', '11111111-1111-1111-1111-111111111111', now() - interval '1 hour'),
  ('cc000000-0000-0000-0000-222222222222', 'direct', '11111111-1111-1111-1111-555555555555', now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  ('cc000000-0000-0000-0000-111111111111', '11111111-1111-1111-1111-111111111111'),
  ('cc000000-0000-0000-0000-111111111111', '11111111-1111-1111-1111-333333333333'),
  ('cc000000-0000-0000-0000-222222222222', '11111111-1111-1111-1111-555555555555'),
  ('cc000000-0000-0000-0000-222222222222', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content) VALUES
  ('cc000000-0000-0000-0000-111111111111', '11111111-1111-1111-1111-111111111111', 'Hey Marcus! Welcome aboard. Ready to ship some amazing features?'),
  ('cc000000-0000-0000-0000-111111111111', '11111111-1111-1111-1111-333333333333', 'Absolutely! Already diving into the codebase. The holographic workspace is wild 🔥'),
  ('cc000000-0000-0000-0000-111111111111', '11111111-1111-1111-1111-111111111111', 'Wait until you see what we have planned for v2. Let''s sync tomorrow at 10am?'),
  ('cc000000-0000-0000-0000-222222222222', '11111111-1111-1111-1111-555555555555', 'David, really impressed by AlloySphere. Would love to discuss a potential investment.'),
  ('cc000000-0000-0000-0000-222222222222', '11111111-1111-1111-1111-111111111111', 'Thanks Alex! Happy to chat. Let me send you our latest deck. When works for a call?');

-- ===== NOTIFICATIONS =====
INSERT INTO notifications (user_id, type, title, body, is_read) VALUES
  ('11111111-1111-1111-1111-111111111111', 'application_received', 'New application received', 'Marcus King applied for Full-Stack Engineer', false),
  ('11111111-1111-1111-1111-111111111111', 'investor_interest', 'Investor interest', 'Alex Rivera saved AlloySphere to their watchlist', false),
  ('11111111-1111-1111-1111-111111111111', 'message', 'New message from Alex Rivera', 'Would love to discuss a potential investment.', false),
  ('11111111-1111-1111-1111-333333333333', 'task_assigned', 'New task assigned', 'Implement new holographic workspace table', true),
  ('11111111-1111-1111-1111-333333333333', 'application_accepted', 'Application accepted!', 'Your application for Full-Stack Engineer at AlloySphere was accepted', true),
  ('11111111-1111-1111-1111-444444444444', 'task_assigned', 'New task assigned', 'Finalize mobile responsive layouts for profile', true),
  ('11111111-1111-1111-1111-555555555555', 'startup_followed', 'New follow', 'CollabHub has a new milestone: 10,000 active users', false);

-- ===== STARTUP FOLLOWERS =====
INSERT INTO startup_followers (startup_id, user_id) VALUES
  ('22222222-2222-2222-2222-111111111111', '11111111-1111-1111-1111-555555555555'),
  ('22222222-2222-2222-2222-111111111111', '11111111-1111-1111-1111-333333333333'),
  ('22222222-2222-2222-2222-111111111111', '11111111-1111-1111-1111-444444444444'),
  ('22222222-2222-2222-2222-333333333333', '11111111-1111-1111-1111-555555555555')
ON CONFLICT (startup_id, user_id) DO NOTHING;

-- ===== DOCUMENT FOLDERS =====
INSERT INTO document_folders (id, workspace_id, name, created_by) VALUES
  ('dd000000-0000-0000-0000-111111111111', '33333333-3333-3333-3333-111111111111', 'Pitch Decks', '11111111-1111-1111-1111-111111111111'),
  ('dd000000-0000-0000-0000-222222222222', '33333333-3333-3333-3333-111111111111', 'Brand Assets', '11111111-1111-1111-1111-444444444444'),
  ('dd000000-0000-0000-0000-333333333333', '33333333-3333-3333-3333-111111111111', 'Engineering Docs', '11111111-1111-1111-1111-333333333333')
ON CONFLICT (id) DO NOTHING;

-- ===== ANALYTICS EVENTS =====
INSERT INTO analytics_events (user_id, event_name, properties) VALUES
  ('11111111-1111-1111-1111-111111111111', 'page_view', '{"page": "/dashboard"}'),
  ('11111111-1111-1111-1111-111111111111', 'startup_created', '{"startup_name": "AlloySphere"}'),
  ('11111111-1111-1111-1111-333333333333', 'task_completed', '{"task_title": "Set up Supabase backend"}'),
  ('11111111-1111-1111-1111-555555555555', 'startup_saved', '{"startup_name": "AlloySphere"}'),
  ('11111111-1111-1111-1111-333333333333', 'application_submitted', '{"opportunity": "Full-Stack Engineer"}'),
  ('11111111-1111-1111-1111-444444444444', 'page_view', '{"page": "/workspace"}');

-- ===== CONNECTION REQUESTS =====
INSERT INTO connection_requests (from_user_id, to_user_id, status, message) VALUES
  ('11111111-1111-1111-1111-555555555555', '11111111-1111-1111-1111-111111111111', 'accepted', 'Would love to connect and discuss AlloySphere.'),
  ('11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-444444444444', 'accepted', 'Hey Sarah! Fellow team member here.')
ON CONFLICT (from_user_id, to_user_id) DO NOTHING;

-- The connections table entries are auto-created by the trigger
