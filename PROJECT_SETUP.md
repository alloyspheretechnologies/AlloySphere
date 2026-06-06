# Local Project Setup Guide

Welcome to the AlloySphere repository! This guide outlines the steps required to set up the project on your local development machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 1. Clone the Repository

```bash
git clone git@github.com:alloyspheretechnologies/AlloySphere.git
cd AlloySphere
```

## 2. Install Dependencies

We use `npm` as our package manager.

```bash
npm install
```

## 3. Environment Variables

Copy the example environment file and configure your local variables. Do **not** commit `.env.local` to version control.

```bash
cp .env.example .env.local
```

Refer to `ENVIRONMENT_VARIABLES.md` for instructions on acquiring these values.

## 4. Supabase Setup (Local Development)

AlloySphere uses Supabase for database, authentication, and storage. To run Supabase locally:

1. Ensure Docker Desktop is running.
2. Initialize and start the local Supabase instance:
   ```bash
   npx supabase init
   npx supabase start
   ```
3. The CLI will output your local API URL, Anon Key, and Service Role Key. Update your `.env.local` with these values.

### Database Migrations

Apply the database schema and seeds to your local instance:

```bash
npx supabase db push
npx supabase db reset
```

Generate TypeScript types from your local database:

```bash
npx supabase gen types typescript --local > lib/types/database.types.gen.ts
```

## 5. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## 6. Testing Authentication

To test Google OAuth locally, you will need to set up Google Cloud Console credentials with authorized redirect URIs pointing to your local Supabase instance. Refer to `GOOGLE_AUTH_SETUP.md` for detailed instructions.

---

### Troubleshooting

- **Supabase CLI fails to start**: Ensure Docker Desktop is running and you have sufficient memory allocated to Docker.
- **Database Connection Issues**: Verify your `.env.local` variables exactly match the output of `npx supabase status`.
- **Type Errors**: If you encounter Supabase type errors, re-run the `supabase gen types` command to ensure your local types match the database schema.
