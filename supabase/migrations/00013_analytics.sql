-- =============================================================
-- AlloySphere Migration 00013: Analytics, Activity & Audit Logs
-- =============================================================

-- Analytics Events (product analytics)
CREATE TABLE analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_name  text NOT NULL,
  properties  jsonb DEFAULT '{}',
  session_id  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_user      ON analytics_events(user_id);
CREATE INDEX idx_analytics_event     ON analytics_events(event_name);
CREATE INDEX idx_analytics_created   ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_session   ON analytics_events(session_id);

-- Activity Logs (user-facing activity stream)
CREATE TABLE activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_activity_user    ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_entity  ON activity_logs(entity_type, entity_id);

-- Audit Logs (security & compliance)
CREATE TABLE audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action      text NOT NULL,
  target_type text,
  target_id   uuid,
  before_data jsonb,
  after_data  jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_actor   ON audit_logs(actor_id);
CREATE INDEX idx_audit_action  ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_target  ON audit_logs(target_type, target_id);
