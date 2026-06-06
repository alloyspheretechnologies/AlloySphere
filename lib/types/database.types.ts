// =============================================================
// AlloySphere — Database Types (Supabase Schema)
// =============================================================
// These types mirror the PostgreSQL schema defined in migrations.
// They follow the Supabase convention for generated types.
// =============================================================

import type {
  UserRole, StartupStage, StartupStatus, StartupVisibility,
  MemberRole, MemberStatus, TaskStatus, TaskPriority,
  ProjectStatus, OpportunityType, ApplicationStatus,
  PostType, NotificationType, ConnectionStatus,
  SkillProficiency, BookmarkEntityType, OpportunityStatus,
  MilestoneStatus,
} from './enums';

// =============================================================
// Table Row Types
// =============================================================

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  name: string;
  username: string | null;
  bio: string | null;
  headline: string | null;
  avatar_url: string | null;
  location: string | null;
  skills: string[];
  portfolio_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Startup {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  industry: string | null;
  stage: StartupStage;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image: string | null;
  status: StartupStatus;
  team_size: number;
  visibility: StartupVisibility;
  created_at: string;
  updated_at: string;
}

export interface StartupMember {
  id: string;
  startup_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  permissions: Record<string, unknown>;
  joined_at: string;
}

export interface StartupRole {
  id: string;
  startup_id: string;
  title: string;
  description: string | null;
  is_filled: boolean;
  created_at: string;
}

export interface StartupFollower {
  id: string;
  startup_id: string;
  user_id: string;
  created_at: string;
}

export interface StartupUpdateRow {
  id: string;
  startup_id: string;
  author_id: string;
  title: string;
  content: string | null;
  update_type: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  startup_id: string;
  name: string;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  workspace_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id: string | null;
  tags: string[];
  due_date: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed_at: string | null;
  status: MilestoneStatus;
  roadmap_id: string | null;
  created_at: string;
}

export interface Roadmap {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: string;
  target_date: string | null;
  visibility: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Opportunity {
  id: string;
  startup_id: string;
  title: string;
  description: string | null;
  required_skills: string[];
  commitment: OpportunityType;
  location: string;
  experience_level: string | null;
  equity_range: string | null;
  status: OpportunityStatus;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  startup_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  resume_url: string | null;
  metadata: Record<string, unknown>;
  applied_at: string;
  reviewed_at: string | null;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  startup_id: string | null;
  type: PostType;
  content: string;
  media_urls: string[];
  attachments: any[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_by: string | null;
  last_message_at: string;
  created_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  last_read_at: string;
  joined_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface DocumentFolder {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  created_by: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  folder_id: string | null;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number;
  uploaded_by: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface InvestorProfile {
  id: string;
  user_id: string;
  firm_name: string | null;
  investment_thesis: string | null;
  check_size_min: number | null;
  check_size_max: number | null;
  preferred_stages: StartupStage[];
  preferred_industries: string[];
  portfolio_count: number;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedStartup {
  id: string;
  user_id: string;
  startup_id: string;
  notes: string | null;
  created_at: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  created_at: string;
}

export interface Connection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
}

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  entity_type: BookmarkEntityType;
  entity_id: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: SkillProficiency;
  endorsed_count: number;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria: Record<string, unknown>;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  points: number;
  badge_id: string | null;
  criteria: Record<string, unknown>;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_name: string;
  properties: Record<string, unknown>;
  session_id: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// =============================================================
// Insert Types (for creating new records)
// =============================================================

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type StartupInsert = Omit<Startup, 'id' | 'created_at' | 'updated_at' | 'team_size'> & {
  id?: string;
  team_size?: number;
};

export type StartupUpdate = Partial<Omit<Startup, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'position'> & {
  id?: string;
  position?: number;
};

export type TaskUpdate = Partial<Omit<Task, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>;

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress'> & {
  id?: string;
  progress?: number;
};

export type ProjectUpdate = Partial<Omit<Project, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>;

export type OpportunityInsert = Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'applications_count'> & {
  id?: string;
};

export type OpportunityUpdate = Partial<Omit<Opportunity, 'id' | 'startup_id' | 'created_at' | 'updated_at' | 'applications_count'>>;

export type ApplicationInsert = Omit<Application, 'id' | 'applied_at' | 'reviewed_at' | 'updated_at' | 'status'> & {
  id?: string;
  status?: ApplicationStatus;
};

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'> & {
  id?: string;
};

export type PostUpdate = Partial<Pick<Post, 'content' | 'media_urls' | 'attachments' | 'type'>>;

export type MessageInsert = Omit<Message, 'id' | 'created_at' | 'updated_at' | 'is_read'> & {
  id?: string;
};

// =============================================================
// View Types
// =============================================================

export interface StartupDashboardView {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  stage: StartupStage;
  status: StartupStatus;
  team_size: number;
  logo_url: string | null;
  owner_id: string;
  created_at: string;
  active_members: number;
  followers_count: number;
  open_opportunities: number;
  total_applications: number;
  pending_applications: number;
  workspace_id: string | null;
  total_tasks: number;
  completed_tasks: number;
  total_projects: number;
}

export interface OpportunityListingView extends Opportunity {
  startup_name: string;
  startup_slug: string;
  startup_logo: string | null;
  startup_industry: string | null;
  startup_stage: StartupStage;
}

export interface WorkspaceOverviewView {
  id: string;
  name: string;
  startup_id: string;
  startup_name: string;
  startup_slug: string;
  project_count: number;
  task_count: number;
  completed_task_count: number;
  document_count: number;
  member_count: number;
}

export interface UserFeedView {
  id: string;
  type: PostType;
  content: string;
  media_urls: string[];
  attachments: any[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author_profile_id: string;
  author_name: string;
  author_username: string | null;
  author_avatar: string | null;
  author_headline: string | null;
  startup_id: string | null;
  startup_name: string | null;
  startup_logo: string | null;
}

export interface ApplicationPipelineView {
  id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  applied_at: string;
  reviewed_at: string | null;
  opportunity_title: string;
  commitment: OpportunityType;
  location: string;
  startup_name: string;
  startup_logo: string | null;
  startup_slug: string;
  applicant_name: string;
  applicant_avatar: string | null;
  applicant_headline: string | null;
  applicant_skills: string[];
}

// =============================================================
// Search Result Type
// =============================================================

export interface SearchResult {
  entity_type: 'profile' | 'startup' | 'opportunity' | 'post';
  entity_id: string;
  title: string;
  subtitle: string;
  avatar_url: string | null;
  rank: number;
}

// =============================================================
// Pagination
// =============================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
