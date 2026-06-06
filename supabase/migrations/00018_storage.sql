-- =============================================================
-- AlloySphere Migration 00018: Storage Buckets & Policies
-- =============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('startup-logos', 'startup-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('startup-covers', 'startup-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, NULL),
  ('attachments', 'attachments', false, 26214400, NULL),
  ('media', 'media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
  ('pitch-decks', 'pitch-decks', false, 52428800, ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- AVATARS: Public read, authenticated upload (own folder)
-- =============================================================
CREATE POLICY "avatars_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

-- =============================================================
-- STARTUP LOGOS: Public read, startup owner upload
-- =============================================================
CREATE POLICY "startup_logos_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'startup-logos');

CREATE POLICY "startup_logos_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'startup-logos'
    AND EXISTS (
      SELECT 1 FROM startups s
      JOIN profiles p ON p.id = s.owner_id
      WHERE s.id::text = (storage.foldername(storage.objects.name))[1]
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "startup_logos_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'startup-logos'
    AND EXISTS (
      SELECT 1 FROM startups s
      JOIN profiles p ON p.id = s.owner_id
      WHERE s.id::text = (storage.foldername(storage.objects.name))[1]
      AND p.user_id = auth.uid()
    )
  );

-- =============================================================
-- STARTUP COVERS: Public read, startup owner upload
-- =============================================================
CREATE POLICY "startup_covers_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'startup-covers');

CREATE POLICY "startup_covers_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'startup-covers'
    AND EXISTS (
      SELECT 1 FROM startups s
      JOIN profiles p ON p.id = s.owner_id
      WHERE s.id::text = (storage.foldername(storage.objects.name))[1]
      AND p.user_id = auth.uid()
    )
  );

-- =============================================================
-- DOCUMENTS: Workspace members only
-- =============================================================
CREATE POLICY "documents_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND is_workspace_member((storage.foldername(storage.objects.name))[1]::uuid)
  );

CREATE POLICY "documents_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND is_workspace_member((storage.foldername(storage.objects.name))[1]::uuid)
  );

CREATE POLICY "documents_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND is_workspace_member((storage.foldername(storage.objects.name))[1]::uuid)
  );

-- =============================================================
-- ATTACHMENTS: Workspace members only
-- =============================================================
CREATE POLICY "attachments_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND is_workspace_member((storage.foldername(storage.objects.name))[1]::uuid)
  );

CREATE POLICY "attachments_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND is_workspace_member((storage.foldername(storage.objects.name))[1]::uuid)
  );

-- =============================================================
-- MEDIA: Any authenticated user
-- =============================================================
CREATE POLICY "media_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "media_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

CREATE POLICY "media_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

-- =============================================================
-- PITCH DECKS: Startup owner + invited users
-- =============================================================
CREATE POLICY "pitch_decks_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pitch-decks'
    AND (
      is_startup_member((storage.foldername(storage.objects.name))[1]::uuid)
      OR EXISTS (
        SELECT 1 FROM saved_startups ss
        WHERE ss.startup_id::text = (storage.foldername(storage.objects.name))[1]
        AND ss.user_id = auth_profile_id()
      )
    )
  );

CREATE POLICY "pitch_decks_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pitch-decks'
    AND is_startup_admin((storage.foldername(storage.objects.name))[1]::uuid)
  );
