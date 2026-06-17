# Magpie Backend Quick Start

This guide gets your Supabase backend running in 10 minutes.

## Prerequisites

- A Supabase account (free tier is fine)
- Terminal access

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **New Project**
4. Fill in:
   - **Name**: magpie-mvp (or your choice)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
5. Click **Create new project**
6. Wait 2-3 minutes for provisioning

## Step 2: Enable PostGIS

### Option A: Dashboard (Easiest)
1. In your project, go to **Database** → **Extensions**
2. Search for "postgis"
3. Click the toggle to enable
4. Wait ~30 seconds

### Option B: SQL Editor
1. Go to **SQL Editor**
2. Click **New query**
3. Paste: `CREATE EXTENSION IF NOT EXISTS postgis;`
4. Click **Run**

## Step 3: Run Migrations

### Option A: Dashboard (No CLI needed)

1. Go to **SQL Editor** → **New query**

2. Open `supabase/migrations/20260616000001_initial_schema.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**
6. Wait for success message

7. Open `supabase/migrations/20260616000002_nearby_search_function.sql`
8. Copy the entire contents
9. Paste into SQL Editor (new query)
10. Click **Run**
11. Wait for success message

### Option B: Using Supabase CLI

```bash
# Install CLI globally
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

To find your `PROJECT_REF`:
- Go to Project Settings → General
- Look for "Reference ID"

## Step 4: Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## Step 5: Configure Frontend

1. In the `frontend/` directory, create `.env`:

```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env`:

```bash
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
```

Replace with your actual values from Step 4.

## Step 6: Verify Setup

### Test in Supabase SQL Editor

```sql
-- Check PostGIS is enabled
SELECT PostGIS_version();

-- Check resources table exists
SELECT COUNT(*) FROM resources;

-- Test nearby search function
SELECT * FROM search_nearby_resources(
  35.7, 51.4, 5000
) LIMIT 5;
```

All three queries should succeed (count will be 0 if no data yet).

## Step 7: Optional - Load Sample Data

If you want test data for development:

1. Open `supabase/seed.sql`
2. Copy the contents
3. Paste into SQL Editor
4. Run it
5. Verify: `SELECT COUNT(*) FROM resources;` should return ~25

## Troubleshooting

### "Extension postgis not found"
- Make sure you enabled PostGIS in Step 2
- Try running: `CREATE EXTENSION postgis;` directly

### "Permission denied for table resources"
- RLS policies may not have been created
- Re-run the initial schema migration

### "Function search_nearby_resources does not exist"
- Run the second migration file
- Check: `SELECT * FROM pg_proc WHERE proname = 'search_nearby_resources';`

### Frontend can't connect
- Double-check your `.env` file has correct values
- Restart your dev server: `npm run dev`
- Check browser console for errors

## Useful Supabase Dashboard Links

- **Table Editor**: Browse and edit data visually
- **SQL Editor**: Run queries and migrations
- **Database** → **Roles**: View permissions
- **Database** → **Replication**: Set up backups
- **Logs**: Monitor queries and errors

## Cost Estimate

Supabase free tier includes:
- 500 MB database space (enough for thousands of resources)
- Unlimited API requests
- 1 GB file storage
- 2 GB bandwidth

MVP should stay well within free tier limits.

## Support

If you get stuck:
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- PostGIS docs: [postgis.net/docs](https://postgis.net/docs)
