# Innovexa ERP

ERP for small businesses, built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase.

> Status: early setup. Supabase is connected, the `businesses` and `profiles` tables are defined, email + password sign-up, login and logout work (`/signup`, `/login`, `/dashboard`), logged-in users can create and edit their business profile with a logo (`/business`), and manage items (`/items`). No stock, billing or other features yet.

## Project structure

```
app/          Routes, layouts and global styles (App Router)
components/   Reusable UI components
lib/          Supabase client (supabase.ts) and shared utilities (utils.ts)
supabase/     SQL migrations
public/       Static assets
```

## Local setup

Prerequisites: Node.js 20.9 or later and npm.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell: `Copy-Item .env.example .env.local`

3. Open `.env.local` and set the values from your Supabase project
   (Project Settings → API):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   `.env.local` is git-ignored. Do not commit real keys.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000.

## Database

SQL migrations live in `supabase/migrations/`. To apply them, open your
Supabase project → **SQL Editor** → **New query**, paste the contents of each
migration file in filename order, and click **Run**.

Then open http://localhost:3000/test-connection. It shows **Connected** once
the app can reach Supabase and the `businesses` table exists.

Row-level security is enabled on every table: a signed-in user can only read
and change rows that belong to their own business.

## Scripts

| Command         | Purpose                      |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Create a production build    |
| `npm run start` | Run the production build     |
| `npm run lint`  | Lint the project with ESLint |
