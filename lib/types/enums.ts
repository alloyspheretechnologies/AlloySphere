// =============================================================
// AlloySphere — TypeScript Enum Types (matching PostgreSQL ENUMs)
// =============================================================

export type UserRole = 'founder' | 'talent' | 'investor' | 'admin';

export type StartupStage = 'idea' | 'mvp' | 'seed' | 'series_a' | 'series_b' | 'growth' | 'ipo';

export type StartupStatus = 'active' | 'inactive' | 'archived';

export type StartupVisibility = 'public' | 'private' | 'invite_only';

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export type MemberStatus = 'active' | 'invited' | 'removed';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type OpportunityType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'equity_only';

export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';

export type PostType = 'text' | 'update' | 'milestone' | 'announcement' | 'general_update' | 'product_launch' | 'funding_update' | 'team_update' | 'investor_update' | 'document_share' | 'media_gallery';

export type NotificationType =
  | 'task_assigned'
  | 'task_updated'
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'mention'
  | 'comment'
  | 'message'
  | 'investor_interest'
  | 'workspace_update'
  | 'member_invited'
  | 'member_joined'
  | 'startup_followed';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export type ConversationType = 'direct' | 'group';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'missed';

export type BookmarkEntityType = 'post' | 'startup' | 'opportunity' | 'project';

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type OpportunityStatus = 'open' | 'closed' | 'paused';
