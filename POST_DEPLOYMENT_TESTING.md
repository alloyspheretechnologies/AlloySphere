# Post-Deployment Testing Checklist

Once AlloySphere is deployed to Vercel and connected to Supabase, perform the following manual tests to verify production readiness.

## 1. Authentication & Onboarding
- [ ] **Google OAuth**: Log in using a Google account. Verify it redirects successfully back to the app without infinite loops.
- [ ] **Role Selection**: As a new user, complete the onboarding flow and select a role (Founder, Talent, or Investor).
- [ ] **Session Persistence**: Refresh the page to ensure you stay logged in.

## 2. Founder Workflow
- [ ] **Startup Creation**: Verify you can create a startup and upload a logo.
- [ ] **Workspace Access**: Verify the Workspace auto-generates upon startup creation.
- [ ] **Roadmap**: Create a Roadmap, add a Milestone, and observe the progress bar update.
- [ ] **Post Creation**: Publish a post with a Media image and a PDF Document. Verify it appears in the Community Feed.
- [ ] **Opportunity Posting**: Post a new job opportunity and verify it shows up on the global Discover board.

## 3. Talent Workflow
- [ ] **Discover Startups**: Verify the Discover page loads active startups.
- [ ] **Job Application**: Apply to a job opportunity with a cover letter. Verify the application appears in "My Applications".
- [ ] **Feed Interaction**: Like a post and leave a comment.

## 4. Investor Workflow
- [ ] **Startup Watchlist**: Save a startup to your watchlist.
- [ ] **Execution & Velocity**: Verify the saved startup's public roadmap milestones appear in your dashboard.
- [ ] **Portfolio**: Verify your portfolio view loads correctly.

## 5. Security & Realtime
- [ ] **RLS Policies**: Attempt to visit another user's private settings URL (if known) and verify it 404s or redirects.
- [ ] **Storage Uploads**: Ensure image uploads to the `avatars` bucket and document uploads to the `documents` bucket succeed.
- [ ] **Notifications**: Verify that applying to a job generates an in-app notification for the Founder.

## 6. Edge Cases
- [ ] Sign out completely.
- [ ] Attempt to access `/workspace` unauthenticated. You should be redirected to `/login`.
