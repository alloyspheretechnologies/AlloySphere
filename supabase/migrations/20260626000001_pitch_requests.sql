-- =============================================================
-- AlloySphere Migration: Pitch Requests
-- =============================================================
-- Enables investors to request a pitch from startup founders.
-- =============================================================

-- Add new notification types for pitch requests
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'pitch_request_received';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'pitch_request_responded';

-- Pitch Requests table
CREATE TABLE pitch_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  startup_id    uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  founder_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'declined', 'expired')),
  message       text,
  response      text,
  created_at    timestamptz DEFAULT now(),
  responded_at  timestamptz,
  UNIQUE(investor_id, startup_id)
);

CREATE INDEX idx_pitch_requests_investor ON pitch_requests(investor_id);
CREATE INDEX idx_pitch_requests_startup  ON pitch_requests(startup_id);
CREATE INDEX idx_pitch_requests_founder  ON pitch_requests(founder_id);
CREATE INDEX idx_pitch_requests_status   ON pitch_requests(status);

-- =============================================================
-- RLS Policies
-- =============================================================
ALTER TABLE pitch_requests ENABLE ROW LEVEL SECURITY;

-- Investors can see their own outgoing requests
-- Founders can see requests targeting their startups
CREATE POLICY "pitch_requests_select"
  ON pitch_requests FOR SELECT
  TO authenticated
  USING (
    investor_id = auth_profile_id()
    OR founder_id = auth_profile_id()
    OR is_admin()
  );

-- Only investors can create pitch requests
CREATE POLICY "pitch_requests_insert"
  ON pitch_requests FOR INSERT
  TO authenticated
  WITH CHECK (investor_id = auth_profile_id());

-- Only the founder can respond (update status/response)
CREATE POLICY "pitch_requests_update"
  ON pitch_requests FOR UPDATE
  TO authenticated
  USING (founder_id = auth_profile_id());

-- Investors can delete/cancel their own requests
CREATE POLICY "pitch_requests_delete"
  ON pitch_requests FOR DELETE
  TO authenticated
  USING (investor_id = auth_profile_id());

-- =============================================================
-- Notification trigger: notify founder on new pitch request
-- =============================================================
CREATE OR REPLACE FUNCTION notify_pitch_request()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_name text;
  v_startup_name  text;
BEGIN
  SELECT name INTO v_investor_name FROM profiles WHERE id = NEW.investor_id;
  SELECT name INTO v_startup_name  FROM startups WHERE id = NEW.startup_id;

  PERFORM create_notification(
    NEW.founder_id,
    'pitch_request_received',
    v_investor_name || ' wants to hear your pitch',
    'An investor is interested in ' || v_startup_name || '. Review their request and respond.',
    jsonb_build_object(
      'pitch_request_id', NEW.id,
      'investor_id', NEW.investor_id,
      'startup_id', NEW.startup_id,
      'link', '/home'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_pitch_request_notify
  AFTER INSERT ON pitch_requests
  FOR EACH ROW EXECUTE FUNCTION notify_pitch_request();
