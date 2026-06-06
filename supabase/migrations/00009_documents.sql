-- =============================================================
-- AlloySphere Migration 00009: Documents & Folders
-- =============================================================

-- Document Folders (tree structure)
CREATE TABLE document_folders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id     uuid REFERENCES document_folders(id) ON DELETE CASCADE,
  name          text NOT NULL,
  created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_doc_folders_workspace ON document_folders(workspace_id);
CREATE INDEX idx_doc_folders_parent    ON document_folders(parent_id);

-- Documents
CREATE TABLE documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id     uuid REFERENCES document_folders(id) ON DELETE SET NULL,
  name          text NOT NULL,
  file_url      text NOT NULL,
  file_type     text,
  file_size     bigint DEFAULT 0,
  uploaded_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  version       integer DEFAULT 1,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_documents_workspace ON documents(workspace_id);
CREATE INDEX idx_documents_folder    ON documents(folder_id);
CREATE INDEX idx_documents_uploaded  ON documents(uploaded_by);

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
