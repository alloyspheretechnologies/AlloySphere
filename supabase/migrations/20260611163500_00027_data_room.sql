-- =============================================================
-- AlloySphere Migration: Startup Data Room & Audit Logs
-- =============================================================

-- Startup Documents Table (Relational, replacing flat columns)
CREATE TABLE startup_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id      uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  uploaded_by     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  file_url        text NOT NULL,
  category        text NOT NULL CHECK (category IN ('investor_facing', 'internal')),
  document_type   text NOT NULL, -- pitch_deck, business_plan, financial_summary, technical_architecture, etc.
  file_size       bigint DEFAULT 0,
  file_type       text,
  is_public       boolean DEFAULT false, -- True if visible on public profile (e.g., One Pager)
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_startup_documents_startup ON startup_documents(startup_id);
CREATE INDEX idx_startup_documents_category ON startup_documents(category);

-- Data Room Access
CREATE TABLE data_room_access (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id      uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  investor_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(startup_id, investor_id)
);

CREATE INDEX idx_data_room_access_startup ON data_room_access(startup_id);
CREATE INDEX idx_data_room_access_investor ON data_room_access(investor_id);

-- Document Audit Logs
CREATE TABLE document_audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     uuid NOT NULL REFERENCES startup_documents(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action          text NOT NULL CHECK (action IN ('upload', 'view', 'download', 'share', 'delete', 'replace')),
  ip_address      text,
  user_agent      text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_logs_document ON document_audit_logs(document_id);
CREATE INDEX idx_audit_logs_user ON document_audit_logs(user_id);

-- RLS for startup_documents
ALTER TABLE startup_documents ENABLE ROW LEVEL SECURITY;

-- 1. Startup Owners & Members can see all documents for their startup
CREATE POLICY "Startup members can view all documents"
  ON startup_documents FOR SELECT
  USING (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid())
  );

-- 2. Investors can see documents IF they have active data room access, OR if the document is public
CREATE POLICY "Investors and public access"
  ON startup_documents FOR SELECT
  USING (
    is_public = true 
    OR 
    startup_id IN (
      SELECT startup_id FROM data_room_access 
      WHERE investor_id = auth.uid() 
      AND status = 'active' 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- 3. Only Owners can insert/update/delete (simplified RBAC for now, can extend to specific member permissions later)
CREATE POLICY "Owners can manage documents"
  ON startup_documents FOR ALL
  USING (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- RLS for data_room_access
ALTER TABLE data_room_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage data room access"
  ON data_room_access FOR ALL
  USING (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Investors can view their own access"
  ON data_room_access FOR SELECT
  USING (investor_id = auth.uid());

-- RLS for audit logs
ALTER TABLE document_audit_logs ENABLE ROW LEVEL SECURITY;

-- System needs to insert logs (Authenticated users trigger this)
CREATE POLICY "Users can insert audit logs"
  ON document_audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only Startup Owners can view logs for their documents
CREATE POLICY "Owners can view document logs"
  ON document_audit_logs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM startup_documents WHERE startup_id IN (
        SELECT startup_id FROM startup_members WHERE user_id = auth.uid() AND role = 'owner'
      )
    )
  );
