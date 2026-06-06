# Environment Variables Guide

This document outlines all environment variables required to run AlloySphere locally and in production.

## Required Variables

These variables must be set in your `.env.local` for local development, and in Vercel for Preview/Production deployments.

### Supabase Connection
* **`NEXT_PUBLIC_SUPABASE_URL`**
  * **Purpose**: The REST URL for your Supabase project. Used by both the client and server to fetch data.
  * **Where Used**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
  * **Example**: `https://xyzcompany.supabase.co`
* **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
  * **Purpose**: The public anonymous key for Supabase. Safe to expose to the browser.
  * **Where Used**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
  * **Example**: `eyJhbGciOiJIUzI1NiIsInR...`

### Application Settings
* **`NEXT_PUBLIC_APP_URL`**
  * **Purpose**: The base URL of the application. Used for absolute links, social sharing, and redirect validation.
  * **Where Used**: Authentication redirects, metadata generation.
  * **Example**: `http://localhost:3000` (Local) or `https://alloysphere.vercel.app` (Prod)

## Optional / Future Integrations

These variables are categorized for upcoming production analytics, tracking, and transactional emails.

### Authentication Providers
* **`GOOGLE_CLIENT_ID`**
  * **Purpose**: Used for Google OAuth login. Note: Supabase handles the actual OAuth flow, so this is typically configured directly in the Supabase Dashboard, but may be used by custom clients.
* **`GOOGLE_CLIENT_SECRET`**
  * **Purpose**: Companion to the Client ID. Kept secret.

### Analytics & Monitoring (Production Only)
* **`POSTHOG_KEY`**
  * **Purpose**: Product analytics tracking.
  * **Example**: `phc_abc123...`
* **`SENTRY_DSN`**
  * **Purpose**: Error tracking and performance monitoring.
  * **Example**: `https://abc@xyz.ingest.sentry.io/123`

### Communications (Production Only)
* **`RESEND_API_KEY`**
  * **Purpose**: Used to send transactional emails (welcome emails, notifications).
  * **Example**: `re_123456789...`

## Security Warning
> [!CAUTION]
> **NEVER** commit `.env`, `.env.local`, `.env.production`, or any file containing real keys (especially Service Role keys or Client Secrets) to version control. They are ignored in `.gitignore` by default.
