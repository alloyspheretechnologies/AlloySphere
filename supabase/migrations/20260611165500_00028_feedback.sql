-- =============================================================
-- AlloySphere Migration: Platform Feedback System
-- =============================================================

CREATE TABLE platform_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type            text NOT NULL CHECK (type IN ('bug', 'feature_request', 'ux_issue', 'general')),
  message         text NOT NULL,
  url             text,
  status          text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_platform_feedback_status ON platform_feedback(status);
CREATE INDEX idx_platform_feedback_created ON platform_feedback(created_at DESC);

-- Allow authenticated users to insert feedback
ALTER TABLE platform_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
  ON platform_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON platform_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view and update all feedback
CREATE POLICY "Admins can view all feedback"
  ON platform_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all feedback"
  ON platform_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
