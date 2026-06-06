-- =============================================================
-- AlloySphere Migration 00008: Notifications
-- =============================================================

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       text NOT NULL,
  body        text,
  data        jsonb DEFAULT '{}',
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user      ON notifications(user_id);
CREATE INDEX idx_notifications_read      ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created   ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type      ON notifications(type);

-- Helper function to create a notification (used by triggers and Edge Functions)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_body text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
