-- =============================================================
-- AlloySphere Migration 00004: Workspaces, Projects & Tasks
-- =============================================================

-- Workspaces (one per startup)
CREATE TABLE workspaces (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    uuid UNIQUE NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  name          text NOT NULL,
  settings      jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_workspaces_startup ON workspaces(startup_id);

-- Auto-create workspace when startup is created
CREATE OR REPLACE FUNCTION handle_workspace_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspaces (startup_id, name)
  VALUES (NEW.id, NEW.name || ' Workspace');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_startup_created_workspace
  AFTER INSERT ON startups
  FOR EACH ROW EXECUTE FUNCTION handle_workspace_creation();

-- Projects
CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  status        project_status DEFAULT 'planning',
  progress      integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date    date,
  due_date      date,
  created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_status    ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tasks
CREATE TABLE tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  status        task_status DEFAULT 'todo',
  priority      task_priority DEFAULT 'medium',
  assignee_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tags          text[] DEFAULT '{}',
  due_date      timestamptz,
  completed_at  timestamptz,
  position      integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_tasks_workspace    ON tasks(workspace_id);
CREATE INDEX idx_tasks_project      ON tasks(project_id);
CREATE INDEX idx_tasks_assignee     ON tasks(assignee_id);
CREATE INDEX idx_tasks_status       ON tasks(status);
CREATE INDEX idx_tasks_priority     ON tasks(priority);
CREATE INDEX idx_tasks_due_date     ON tasks(due_date);
CREATE INDEX idx_tasks_tags         ON tasks USING GIN(tags);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-set completed_at when status changes to 'done'
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_completion
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_task_completion();

-- Task Comments
CREATE TABLE task_comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       text NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);

CREATE TRIGGER trg_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Milestones
CREATE TABLE milestones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  target_date   date,
  completed_at  timestamptz,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_milestones_project ON milestones(project_id);

-- Roadmaps
CREATE TABLE roadmaps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_roadmaps_workspace ON roadmaps(workspace_id);

CREATE TRIGGER trg_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Workspace Activity Log
CREATE TABLE workspace_activity (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action        text NOT NULL,
  entity_type   text,
  entity_id     uuid,
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_workspace_activity_workspace ON workspace_activity(workspace_id);
CREATE INDEX idx_workspace_activity_created   ON workspace_activity(created_at DESC);
