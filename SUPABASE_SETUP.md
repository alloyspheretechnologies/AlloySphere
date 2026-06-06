# Supabase Pre-Deployment Setup Guide

Before deploying AlloySphere to Vercel, you must properly configure your production/staging Supabase instance. This guide covers the essential steps.

## 1. Project Creation
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project. Select your desired region (e.g., US East) and set a strong database password.
3. Once provisioned, go to **Project Settings -> API** and copy the `URL` and `anon public` key. Add these to your Vercel environment variables.

## 2. Apply Database Migrations
Since we are moving from a local environment to staging/production, we need to push the schema.
Assuming your Supabase CLI is authenticated:
1. Link your local project to the remote Supabase project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
2. Push your migrations to the remote database:
   ```bash
   npx supabase db push
   ```
This will automatically execute `00001_enums_and_extensions.sql` through `00021_roadmap_enhancements.sql`.

## 3. Configure Authentication
AlloySphere relies on Google OAuth and email login.
1. Go to **Authentication -> Providers**.
2. Enable **Google**.
3. You will need your Google Client ID and Secret (refer to `GOOGLE_AUTH_SETUP.md`).
4. Enable **Email** provider. Decide if you want to require Email Confirmation before allowing logins.

## 4. Redirect URLs
This is **CRITICAL** for successful deployment.
1. Go to **Authentication -> URL Configuration**.
2. **Site URL**: Set this to your primary production domain (e.g., `https://alloysphere.vercel.app`).
3. **Redirect URLs**: You MUST add the following URLs to allow successful OAuth redirects:
   - `http://localhost:3000/**` (For local development)
   - `https://alloysphere.vercel.app/**` (For production)
   - `https://*-alloyspheretechnologies.vercel.app/**` (Wildcard for Vercel preview deployments)

## 5. Storage Buckets
AlloySphere utilizes Supabase Storage for avatars, cover photos, documents, and media posts.
If your migrations did not automatically create them, manually create the following buckets under **Storage**:
- `avatars` (Public)
- `covers` (Public)
- `documents` (Public)

## 6. Edge Functions (Future Proofing)
If AlloySphere uses Edge Functions (e.g., for Stripe webhooks or Resend emails), deploy them via CLI:
```bash
npx supabase functions deploy
```

## Verification Checklist
- [ ] Database tables are populated.
- [ ] RLS policies exist and are enforced.
- [ ] Google OAuth Provider is enabled.
- [ ] Site URL and Redirect URLs are configured.
- [ ] Storage buckets are created and marked public.
