-- =============================================================
-- AlloySphere Migration 00016: Additional Triggers
-- =============================================================

-- ===== Notification Triggers =====

-- Notify on task assignment
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL AND (OLD.assignee_id IS NULL OR NEW.assignee_id != OLD.assignee_id) THEN
    PERFORM create_notification(
      NEW.assignee_id,
      'task_assigned',
      'New task assigned to you',
      NEW.title,
      jsonb_build_object(
        'task_id', NEW.id,
        'workspace_id', NEW.workspace_id,
        'project_id', NEW.project_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_task_assigned
  AFTER INSERT OR UPDATE OF assignee_id ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assigned();

-- Notify on task status update (to reporter)
CREATE OR REPLACE FUNCTION notify_task_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.reporter_id IS NOT NULL AND NEW.reporter_id != (
    SELECT user_id FROM profiles WHERE id = NEW.assignee_id
  ) THEN
    PERFORM create_notification(
      NEW.reporter_id,
      'task_updated',
      'Task status updated: ' || NEW.status::text,
      NEW.title,
      jsonb_build_object(
        'task_id', NEW.id,
        'old_status', OLD.status::text,
        'new_status', NEW.status::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_task_updated
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_updated();

-- Notify startup owner on new application
CREATE OR REPLACE FUNCTION notify_application_received()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_opp_title text;
BEGIN
  SELECT s.owner_id, o.title INTO v_owner_id, v_opp_title
  FROM startups s
  JOIN opportunities o ON o.id = NEW.opportunity_id
  WHERE s.id = NEW.startup_id;

  IF v_owner_id IS NOT NULL THEN
    PERFORM create_notification(
      v_owner_id,
      'application_received',
      'New application received',
      'Someone applied for: ' || v_opp_title,
      jsonb_build_object(
        'application_id', NEW.id,
        'opportunity_id', NEW.opportunity_id,
        'applicant_id', NEW.applicant_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_application_received
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_received();

-- Notify applicant on application status change
CREATE OR REPLACE FUNCTION notify_application_status()
RETURNS TRIGGER AS $$
DECLARE
  v_opp_title text;
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('accepted', 'rejected', 'interview') THEN
    SELECT title INTO v_opp_title FROM opportunities WHERE id = NEW.opportunity_id;

    PERFORM create_notification(
      NEW.applicant_id,
      CASE NEW.status
        WHEN 'accepted' THEN 'application_accepted'::notification_type
        WHEN 'rejected' THEN 'application_rejected'::notification_type
        ELSE 'task_updated'::notification_type
      END,
      'Application ' || NEW.status::text,
      'Your application for "' || v_opp_title || '" has been ' || NEW.status::text,
      jsonb_build_object(
        'application_id', NEW.id,
        'opportunity_id', NEW.opportunity_id,
        'status', NEW.status::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_application_status
  AFTER UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_status();

-- Notify on new message (to other participants)
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_participant RECORD;
  v_sender_name text;
BEGIN
  SELECT name INTO v_sender_name FROM profiles WHERE id = NEW.sender_id;

  FOR v_participant IN
    SELECT user_id FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LOOP
    PERFORM create_notification(
      v_participant.user_id,
      'message',
      'New message from ' || v_sender_name,
      LEFT(NEW.content, 100),
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id
      )
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- Notify on startup followed
CREATE OR REPLACE FUNCTION notify_startup_followed()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_follower_name text;
  v_startup_name text;
BEGIN
  SELECT s.owner_id, s.name INTO v_owner_id, v_startup_name
  FROM startups s WHERE s.id = NEW.startup_id;

  SELECT name INTO v_follower_name FROM profiles WHERE id = NEW.user_id;

  IF v_owner_id IS NOT NULL AND v_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_owner_id,
      'startup_followed',
      v_follower_name || ' followed ' || v_startup_name,
      NULL,
      jsonb_build_object(
        'startup_id', NEW.startup_id,
        'follower_id', NEW.user_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_startup_followed
  AFTER INSERT ON startup_followers
  FOR EACH ROW EXECUTE FUNCTION notify_startup_followed();

-- ===== Workspace Activity Logging =====

CREATE OR REPLACE FUNCTION log_workspace_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log task changes
  IF TG_TABLE_NAME = 'tasks' THEN
    INSERT INTO workspace_activity (workspace_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.workspace_id,
      COALESCE(NEW.assignee_id, NEW.reporter_id),
      CASE TG_OP
        WHEN 'INSERT' THEN 'task_created'
        WHEN 'UPDATE' THEN 'task_updated'
        ELSE 'task_deleted'
      END,
      'task',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'status', NEW.status::text)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_task_activity
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_workspace_activity();
