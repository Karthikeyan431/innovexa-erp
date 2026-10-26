# Innovexa ERP

ERP for small businesses, built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase.

> Status: initial scaffold. No features, database tables or authentication yet.

## Project structure

```
app/          Routes, layouts and global styles (App Router)
components/   Reusable UI components
lib/          Supabase client (supabase.ts) and shared utilities (utils.ts)
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

## Scripts

| Command         | Purpose                      |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Create a production build    |
| `npm run start` | Run the production build     |
| `npm run lint`  | Lint the project with ESLint |
