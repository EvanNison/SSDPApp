# Supabase Setup Guide (5 minutes)

## Step 1: Create a Supabase Account
1. Go to https://supabase.com and sign up (free)
2. Click **"New Project"**
3. Give it a name: `ssdp-app`
4. Choose a database password (save this somewhere safe)
5. Select a region close to your users (e.g., East US)
6. Click **Create new project** and wait ~2 minutes

## Step 2: Get Your API Keys
1. In the Supabase dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under "Configuration"
3. Copy these two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

## Step 3: Share With Claude
Paste the two values here in chat. I'll wire them into the app and run the database migrations.

## Step 4: Run the Database Migrations (Claude will do this)
The SQL files in `ssdp-app/supabase/migrations/` need to be run in the Supabase SQL Editor:
1. `00001_initial_schema.sql` — Creates all tables
2. `00002_rls_policies.sql` — Sets up security rules
3. `00003_seed_courses.sql` — Loads the 3 training courses + chat channels + menu items

## Step 5: Create Your Admin Account
1. In the Supabase dashboard, click **Authentication** in the left sidebar
2. Click **Add user** > **Create new user**
3. Enter your email and a password
4. After creating the user, go to **Table Editor** > **profiles**
5. Find your user row and change the `role` column to `admin`

Now both the mobile app and admin dashboard will work!
