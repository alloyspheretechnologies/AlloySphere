-- =============================================================
-- AlloySphere Migration 00017: Row Level Security (RLS)
-- =============================================================
-- CRITICAL: Every table gets RLS enabled.
-- No table is publicly writable without explicit policies.
-- =============================================================

-- Helper: Get the profile ID for the current auth user
CREATE OR REPLACE FUNCTION auth_profile_id()
RETURNS uuid AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is a member of a startup
CREATE OR REPLACE FUNCTION is_startup_member(p_startup_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM startup_members
    WHERE startup_id = p_startup_id
    AND user_id = auth_profile_id()
    AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is owner/admin of a startup
CREATE OR REPLACE FUNCTION is_startup_admin(p_startup_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM startup_members
    WHERE startup_id = p_startup_id
    AND user_id = auth_profile_id()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is a workspace member
CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspaces w
    JOIN startup_members sm ON sm.startup_id = w.startup_id
    WHERE w.id = p_workspace_id
    AND sm.user_id = auth_profile_id()
    AND sm.status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================
-- PROFILES
-- =============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated
  USING (true); -- All authenticated users can view profiles

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================
-- STARTUPS
-- =============================================================
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "startups_select_public"
  ON startups FOR SELECT
  TO authenticated
  USING (
    visibility = 'public'
    OR is_startup_member(id)
    OR is_admin()
  );

CREATE POLICY "startups_insert"
  ON startups FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth_profile_id());

CREATE POLICY "startups_update"
  ON startups FOR UPDATE
  TO authenticated
  USING (is_startup_admin(id))
  WITH CHECK (is_startup_admin(id));

CREATE POLICY "startups_delete"
  ON startups FOR DELETE
  TO authenticated
  USING (owner_id = auth_profile_id() OR is_admin());

-- =============================================================
-- STARTUP MEMBERS
-- =============================================================
ALTER TABLE startup_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "startup_members_select"
  ON startup_members FOR SELECT
  TO authenticated
  USING (is_startup_member(startup_id) OR is_admin());

CREATE POLICY "startup_members_insert"
  ON startup_members FOR INSERT
  TO authenticated
  WITH CHECK (is_startup_admin(startup_id));

CREATE POLICY "startup_members_update"
  ON startup_members FOR UPDATE
  TO authenticated
  USING (is_startup_admin(startup_id));

CREATE POLICY "startup_members_delete"
  ON startup_members FOR DELETE
  TO authenticated
  USING (is_startup_admin(startup_id) OR user_id = auth_profile_id());

-- =============================================================
-- STARTUP ROLES
-- =============================================================
ALTER TABLE startup_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "startup_roles_select"
  ON startup_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "startup_roles_modify"
  ON startup_roles FOR ALL
  TO authenticated
  USING (is_startup_admin(startup_id))
  WITH CHECK (is_startup_admin(startup_id));

-- =============================================================
-- STARTUP FOLLOWERS
-- =============================================================
ALTER TABLE startup_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "startup_followers_select"
  ON startup_followers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "startup_followers_insert"
  ON startup_followers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "startup_followers_delete"
  ON startup_followers FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());

-- =============================================================
-- STARTUP UPDATES
-- =============================================================
ALTER TABLE startup_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "startup_updates_select"
  ON startup_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "startup_updates_insert"
  ON startup_updates FOR INSERT
  TO authenticated
  WITH CHECK (is_startup_member(startup_id));

CREATE POLICY "startup_updates_delete"
  ON startup_updates FOR DELETE
  TO authenticated
  USING (author_id = auth_profile_id() OR is_startup_admin(startup_id));

-- =============================================================
-- WORKSPACES
-- =============================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select"
  ON workspaces FOR SELECT
  TO authenticated
  USING (is_workspace_member(id) OR is_admin());

CREATE POLICY "workspaces_update"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (is_workspace_member(id));

-- =============================================================
-- PROJECTS
-- =============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select"
  ON projects FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id) OR is_admin());

CREATE POLICY "projects_insert"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "projects_update"
  ON projects FOR UPDATE
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "projects_delete"
  ON projects FOR DELETE
  TO authenticated
  USING (created_by = auth_profile_id() OR is_admin());

-- =============================================================
-- TASKS
-- =============================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select"
  ON tasks FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id) OR is_admin());

CREATE POLICY "tasks_insert"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "tasks_update"
  ON tasks FOR UPDATE
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "tasks_delete"
  ON tasks FOR DELETE
  TO authenticated
  USING (is_workspace_member(workspace_id));

-- =============================================================
-- TASK COMMENTS
-- =============================================================
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_comments_select"
  ON task_comments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks t WHERE t.id = task_id AND is_workspace_member(t.workspace_id)
  ));

CREATE POLICY "task_comments_insert"
  ON task_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth_profile_id()
    AND EXISTS (
      SELECT 1 FROM tasks t WHERE t.id = task_id AND is_workspace_member(t.workspace_id)
    )
  );

CREATE POLICY "task_comments_update"
  ON task_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth_profile_id());

CREATE POLICY "task_comments_delete"
  ON task_comments FOR DELETE
  TO authenticated
  USING (author_id = auth_profile_id());

-- =============================================================
-- MILESTONES
-- =============================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_select"
  ON milestones FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_id AND is_workspace_member(p.workspace_id)
  ));

CREATE POLICY "milestones_modify"
  ON milestones FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_id AND is_workspace_member(p.workspace_id)
  ));

-- =============================================================
-- ROADMAPS
-- =============================================================
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmaps_select"
  ON roadmaps FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "roadmaps_modify"
  ON roadmaps FOR ALL
  TO authenticated
  USING (is_workspace_member(workspace_id));

-- =============================================================
-- WORKSPACE ACTIVITY
-- =============================================================
ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_activity_select"
  ON workspace_activity FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

-- Insert is done via triggers (SECURITY DEFINER)

-- =============================================================
-- OPPORTUNITIES
-- =============================================================
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_select"
  ON opportunities FOR SELECT
  TO authenticated
  USING (status = 'open' OR is_startup_member(startup_id) OR is_admin());

CREATE POLICY "opportunities_insert"
  ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (is_startup_admin(startup_id));

CREATE POLICY "opportunities_update"
  ON opportunities FOR UPDATE
  TO authenticated
  USING (is_startup_admin(startup_id));

CREATE POLICY "opportunities_delete"
  ON opportunities FOR DELETE
  TO authenticated
  USING (is_startup_admin(startup_id));

-- =============================================================
-- APPLICATIONS
-- =============================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select"
  ON applications FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth_profile_id()
    OR is_startup_admin(startup_id)
    OR is_admin()
  );

CREATE POLICY "applications_insert"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth_profile_id());

CREATE POLICY "applications_update_applicant"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    applicant_id = auth_profile_id()
    OR is_startup_admin(startup_id)
  );

CREATE POLICY "applications_delete"
  ON applications FOR DELETE
  TO authenticated
  USING (applicant_id = auth_profile_id());

-- =============================================================
-- POSTS
-- =============================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "posts_insert"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth_profile_id());

CREATE POLICY "posts_update"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth_profile_id());

CREATE POLICY "posts_delete"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth_profile_id() OR is_admin());

-- =============================================================
-- POST LIKES
-- =============================================================
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "post_likes_insert"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "post_likes_delete"
  ON post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());

-- =============================================================
-- POST COMMENTS
-- =============================================================
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_comments_select"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "post_comments_insert"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth_profile_id());

CREATE POLICY "post_comments_update"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth_profile_id());

CREATE POLICY "post_comments_delete"
  ON post_comments FOR DELETE
  TO authenticated
  USING (author_id = auth_profile_id() OR is_admin());

-- =============================================================
-- CONVERSATIONS
-- =============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select"
  ON conversations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = id
    AND cp.user_id = auth_profile_id()
  ));

CREATE POLICY "conversations_insert"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth_profile_id());

-- =============================================================
-- CONVERSATION PARTICIPANTS
-- =============================================================
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_participants_select"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = auth_profile_id()
  ));

CREATE POLICY "conv_participants_insert"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Controlled via Edge Function

CREATE POLICY "conv_participants_update"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth_profile_id());

-- =============================================================
-- MESSAGES
-- =============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = auth_profile_id()
  ));

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth_profile_id()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
      AND cp.user_id = auth_profile_id()
    )
  );

CREATE POLICY "messages_update"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth_profile_id());

-- =============================================================
-- NOTIFICATIONS
-- =============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth_profile_id());

CREATE POLICY "notifications_update"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth_profile_id());

-- Insert done via SECURITY DEFINER functions

-- =============================================================
-- DOCUMENTS & FOLDERS
-- =============================================================
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_folders_select"
  ON document_folders FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "doc_folders_insert"
  ON document_folders FOR INSERT
  TO authenticated
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "doc_folders_update"
  ON document_folders FOR UPDATE
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "doc_folders_delete"
  ON document_folders FOR DELETE
  TO authenticated
  USING (created_by = auth_profile_id() OR is_admin());

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select"
  ON documents FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "documents_insert"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "documents_update"
  ON documents FOR UPDATE
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "documents_delete"
  ON documents FOR DELETE
  TO authenticated
  USING (uploaded_by = auth_profile_id() OR is_admin());

-- =============================================================
-- INVESTOR PROFILES
-- =============================================================
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investor_profiles_select"
  ON investor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_profiles_insert"
  ON investor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "investor_profiles_update"
  ON investor_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth_profile_id());

-- =============================================================
-- SAVED STARTUPS & OPPORTUNITIES
-- =============================================================
ALTER TABLE saved_startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_startups_select"
  ON saved_startups FOR SELECT
  TO authenticated
  USING (user_id = auth_profile_id());

CREATE POLICY "saved_startups_insert"
  ON saved_startups FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "saved_startups_delete"
  ON saved_startups FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());

ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_opps_select"
  ON saved_opportunities FOR SELECT
  TO authenticated
  USING (user_id = auth_profile_id());

CREATE POLICY "saved_opps_insert"
  ON saved_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "saved_opps_delete"
  ON saved_opportunities FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());

-- =============================================================
-- CONNECTIONS & REQUESTS
-- =============================================================
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connections_select"
  ON connections FOR SELECT
  TO authenticated
  USING (
    user_a_id = auth_profile_id()
    OR user_b_id = auth_profile_id()
    OR is_admin()
  );

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conn_requests_select"
  ON connection_requests FOR SELECT
  TO authenticated
  USING (
    from_user_id = auth_profile_id()
    OR to_user_id = auth_profile_id()
  );

CREATE POLICY "conn_requests_insert"
  ON connection_requests FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth_profile_id());

CREATE POLICY "conn_requests_update"
  ON connection_requests FOR UPDATE
  TO authenticated
  USING (to_user_id = auth_profile_id()); -- Only recipient can accept/reject

-- =============================================================
-- BOOKMARKS
-- =============================================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_select"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth_profile_id());

CREATE POLICY "bookmarks_insert"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "bookmarks_delete"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());

-- =============================================================
-- SKILLS, BADGES, ACHIEVEMENTS
-- =============================================================
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Admin-only insert for skills catalog
CREATE POLICY "skills_insert"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skills_select"
  ON user_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user_skills_insert"
  ON user_skills FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "user_skills_delete"
  ON user_skills FOR DELETE
  TO authenticated
  USING (user_id = auth_profile_id());

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_select"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================
-- ANALYTICS & LOGS
-- =============================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_insert"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth_profile_id());

CREATE POLICY "analytics_select_admin"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (user_id = auth_profile_id() OR is_admin());

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_select"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth_profile_id() OR is_admin());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());
