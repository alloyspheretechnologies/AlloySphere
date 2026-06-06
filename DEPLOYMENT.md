# Vercel Deployment Guide

AlloySphere is built with Next.js App Router and optimized for deployment on Vercel.

## 1. Prerequisites
Before deploying to Vercel, ensure:
- Your GitHub repository is updated with the latest code on the `main` branch.
- You have provisioned a remote Supabase instance (see `SUPABASE_SETUP.md`).
- You have configured Google Auth (see `GOOGLE_AUTH_SETUP.md`).
- You have gathered all necessary Environment Variables (see `ENVIRONMENT_VARIABLES.md`).

## 2. Create Vercel Project
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New... > Project**.
3. Under "Import Git Repository", find your GitHub repository (`AlloySphere`) and click **Import**.

## 3. Configure Build Settings
Vercel should automatically detect that this is a Next.js project. Verify the following:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (or leave default)
- **Install Command**: `npm install` (or leave default)

## 4. Environment Variables
Expand the **Environment Variables** section. You **must** add the following variables before deploying:

- `NEXT_PUBLIC_SUPABASE_URL`: (from your Supabase Dashboard)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (from your Supabase Dashboard)
- `SUPABASE_SERVICE_ROLE_KEY`: (from your Supabase Dashboard)
- `NEXT_PUBLIC_APP_URL`: `https://your-vercel-domain.vercel.app` (You can update this later if you add a custom domain)

*Click **Deploy**.*

## 5. Preview vs Production Domains
Vercel automatically provisions a Production domain (e.g., `alloysphere.vercel.app`) and Preview domains for every pull request/branch.

> [!WARNING]
> **Supabase Redirects**
> Supabase must be explicitly told to allow redirects to Vercel preview URLs. Go to your Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs, and add:
> `https://*-alloyspheretechnologies.vercel.app/**` (Adjust to your exact Vercel team/project slug wildcard).

## 6. Post-Deployment Verification
Once Vercel says "Ready":
1. Visit the deployed domain.
2. Attempt to log in via Google.
3. If login fails and redirects to an error page, your `NEXT_PUBLIC_APP_URL` in Vercel or your Redirect URIs in Supabase/Google are misconfigured.
4. Verify you can access the Dashboard and data loads properly.
