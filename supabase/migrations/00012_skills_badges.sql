-- =============================================================
-- AlloySphere Migration 00012: Skills, Badges & Achievements
-- =============================================================

-- Skills Catalog
CREATE TABLE skills (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  category    text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_skills_name     ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);

-- User Skills (junction)
CREATE TABLE user_skills (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id        uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency     text DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  endorsed_count  integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user  ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);

-- Badges
CREATE TABLE badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  description text,
  icon_url    text,
  criteria    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- Achievements (definitions)
CREATE TABLE achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  description text,
  points      integer DEFAULT 0,
  badge_id    uuid REFERENCES badges(id) ON DELETE SET NULL,
  criteria    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- User Achievements (earned)
CREATE TABLE user_achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id  uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
