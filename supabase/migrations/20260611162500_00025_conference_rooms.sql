-- =============================================================
-- AlloySphere Migration: Conference Rooms & Files
-- =============================================================

CREATE TABLE conference_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name       text NOT NULL,
  livekit_room_id text NOT NULL UNIQUE,
  workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  startup_id      uuid REFERENCES startups(id) ON DELETE CASCADE,
  created_by      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_conference_rooms_livekit_room_id ON conference_rooms(livekit_room_id);
CREATE INDEX idx_conference_rooms_startup_id ON conference_rooms(startup_id);
CREATE INDEX idx_conference_rooms_workspace_id ON conference_rooms(workspace_id);

-- Storage bucket for conference files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('conference_files', 'conference_files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for conference_rooms
ALTER TABLE conference_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active conference rooms for their startup/workspace"
  ON conference_rooms FOR SELECT
  USING (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()) OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can create conference rooms"
  ON conference_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their conference rooms"
  ON conference_rooms FOR UPDATE
  USING (auth.uid() = created_by);

-- Storage policies for conference_files (Private Bucket)
CREATE POLICY "Users can upload to conference_files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'conference_files' AND auth.uid() = owner);

CREATE POLICY "Users can view conference_files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'conference_files' AND auth.role() = 'authenticated');
