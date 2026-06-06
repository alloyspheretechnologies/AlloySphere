# Google Authentication Setup Guide

AlloySphere uses Google OAuth for seamless authentication. To use this in preview or production environments, you must correctly configure credentials in the Google Cloud Console and link them to Supabase.

## 1. Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > OAuth consent screen**.
   - Choose **External** (unless restricting to an internal Google Workspace organization).
   - Fill in the required fields (App Name: AlloySphere, User support email).
   - Under **Authorized domains**, add:
     - `vercel.app` (if deploying on Vercel)
     - `supabase.co` (if using hosted Supabase)
     - Your custom domain (e.g., `alloysphere.com`)
   - Save and Continue.
4. Navigate to **APIs & Services > Credentials**.
5. Click **Create Credentials > OAuth client ID**.
   - **Application type**: Web application
   - **Name**: AlloySphere Auth

## 2. Authorized Origins & Redirect URIs
This step is critical. You must whitelist the URLs where the OAuth request originates, and where Google is allowed to redirect the user back to (which will be your Supabase instance).

### Authorized JavaScript origins
Add the base URLs where your application runs:
- `http://localhost:3000` (Local)
- `https://alloysphere.vercel.app` (Production)
- `https://*-alloyspheretechnologies.vercel.app` (Wildcard for Preview deployments, if supported, otherwise add specific preview URLs or rely on the Supabase redirect)

### Authorized redirect URIs
This must point to your **Supabase Project's OAuth callback URL**.
Format: `https://<your-project-ref>.supabase.co/auth/v1/callback`

1. Go to your Supabase Dashboard -> **Authentication -> Providers -> Google**.
2. Expand the section to find the exact Callback URL provided by Supabase.
3. Add this URL to the **Authorized redirect URIs** in Google Cloud Console.
4. Save your credentials.

## 3. Link Google to Supabase
1. Copy the **Client ID** and **Client Secret** from Google Cloud Console.
2. Go back to Supabase -> **Authentication -> Providers -> Google**.
3. Toggle "Enable Google".
4. Paste the Client ID and Client Secret.
5. Save.

## 4. Final Vercel Check
Ensure that the `NEXT_PUBLIC_APP_URL` environment variable in Vercel is set to your correct domain (e.g., `https://alloysphere.vercel.app`) so that Supabase knows where to redirect the user *after* the successful OAuth loop.
