-- =============================================================
-- AlloySphere Migration: Beta Waitlist System
-- =============================================================

CREATE TABLE invite_codes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,
  max_uses        integer DEFAULT 1,
  current_uses    integer DEFAULT 0,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE beta_waitlist (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  role            text NOT NULL,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code_used text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_waitlist_status ON beta_waitlist(status);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);

-- Allow authenticated users to add themselves to the waitlist
ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert themselves to waitlist"
  ON beta_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own waitlist status"
  ON beta_waitlist FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view and update
CREATE POLICY "Admins can view all waitlist"
  ON beta_waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update waitlist"
  ON beta_waitlist FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
