-- =============================================================
-- AlloySphere Migration 00011: Social (Connections & Bookmarks)
-- =============================================================

-- Connections (mutual relationships between users)
CREATE TABLE connections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id) -- Enforce ordering to prevent duplicates
);

CREATE INDEX idx_connections_user_a ON connections(user_a_id);
CREATE INDEX idx_connections_user_b ON connections(user_b_id);

-- Connection Requests
CREATE TABLE connection_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        connection_status DEFAULT 'pending',
  message       text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_conn_requests_from   ON connection_requests(from_user_id);
CREATE INDEX idx_conn_requests_to     ON connection_requests(to_user_id);
CREATE INDEX idx_conn_requests_status ON connection_requests(status);

CREATE TRIGGER trg_conn_requests_updated_at
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create connection on request acceptance
CREATE OR REPLACE FUNCTION handle_connection_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO connections (user_a_id, user_b_id)
    VALUES (
      LEAST(NEW.from_user_id, NEW.to_user_id),
      GREATEST(NEW.from_user_id, NEW.to_user_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_connection_accepted
  AFTER UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION handle_connection_accepted();

-- Generic Bookmarks (polymorphic)
CREATE TABLE bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('post', 'startup', 'opportunity', 'project')),
  entity_id   uuid NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_bookmarks_user   ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_entity ON bookmarks(entity_type, entity_id);
