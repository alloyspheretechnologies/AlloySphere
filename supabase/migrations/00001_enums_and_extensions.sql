-- =============================================================
-- AlloySphere Migration 00001: Extensions & Enum Types
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- Accent-insensitive search

-- =============================================================
-- ENUM TYPES
-- =============================================================

-- User roles
CREATE TYPE user_role AS ENUM ('founder', 'talent', 'investor', 'admin');

-- Startup lifecycle stages
CREATE TYPE startup_stage AS ENUM ('idea', 'mvp', 'seed', 'series_a', 'series_b', 'growth', 'ipo');

-- Startup statuses
CREATE TYPE startup_status AS ENUM ('active', 'inactive', 'archived');

-- Startup visibility
CREATE TYPE startup_visibility AS ENUM ('public', 'private', 'invite_only');

-- Member role within a startup
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Member status
CREATE TYPE member_status AS ENUM ('active', 'invited', 'removed');

-- Task status (Kanban columns)
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'cancelled');

-- Task priority
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Project status
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled');

-- Opportunity commitment type
CREATE TYPE opportunity_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'equity_only');

-- Application pipeline status
CREATE TYPE application_status AS ENUM ('applied', 'reviewing', 'interview', 'accepted', 'rejected', 'withdrawn');

-- Post type
CREATE TYPE post_type AS ENUM ('text', 'update', 'milestone', 'announcement');

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'task_updated',
  'application_received',
  'application_accepted',
  'application_rejected',
  'mention',
  'comment',
  'message',
  'investor_interest',
  'workspace_update',
  'member_invited',
  'member_joined',
  'startup_followed'
);

-- Connection status
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
