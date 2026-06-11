-- =============================================================
-- AlloySphere Migration: Profile & Startup Document Storage
-- =============================================================

-- Add document columns to profiles
ALTER TABLE profiles 
  ADD COLUMN resume_url text,
  ADD COLUMN certifications_url text;

-- Add document columns to startups
ALTER TABLE startups
  ADD COLUMN pitch_deck_url text,
  ADD COLUMN business_plan_url text,
  ADD COLUMN financial_summary_url text;

-- Add document columns to investor_profiles
ALTER TABLE investor_profiles
  ADD COLUMN investor_profile_url text,
  ADD COLUMN portfolio_overview_url text;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile_documents', 'profile_documents', false),
  ('startup_documents', 'startup_documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for profile_documents (Private Bucket)
CREATE POLICY "Users can upload their own profile documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile_documents' AND auth.uid() = owner);

CREATE POLICY "Users can manage their own profile documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile_documents' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own profile documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile_documents' AND auth.uid() = owner);

CREATE POLICY "Authenticated users can view profile documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_documents' AND auth.role() = 'authenticated');

-- RLS for startup_documents (Private Bucket)
CREATE POLICY "Users can upload startup documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'startup_documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view startup documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'startup_documents' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can delete startup documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'startup_documents' AND auth.uid() = owner);
