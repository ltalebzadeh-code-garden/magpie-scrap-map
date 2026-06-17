# Magpie Supabase Backend

This directory contains the database schema and migrations for the Magpie MVP.

## Database Schema

### `resources` Table

The core table storing all user-posted resource pins.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated unique identifier |
| `title` | TEXT | NOT NULL, 3-100 chars | Resource title |
| `description` | TEXT | NOT NULL, 10-1000 chars | Detailed description |
| `category` | TEXT | NOT NULL, enum | Resource category |
| `status` | TEXT | NOT NULL, enum, default 'available' | Availability status |
| `latitude` | DOUBLE PRECISION | NOT NULL, -90 to 90 | Location latitude |
| `longitude` | DOUBLE PRECISION | NOT NULL, -180 to 180 | Location longitude |
| `location_accuracy` | TEXT | enum, default 'approximate' | Location precision indicator |
| `location` | GEOGRAPHY(POINT) | Computed from lat/lon | PostGIS geography for spatial queries |
| `contact_method` | TEXT | Optional, 3-200 chars | How to contact poster |
| `photo_url` | TEXT | Optional, 10-500 chars | URL to resource photo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, auto-updated | Last modification timestamp |
| `expires_at` | TIMESTAMPTZ | Optional | Expiration timestamp for auto-stale |
| `device_id_hash` | TEXT | Optional, 64 chars | SHA-256 hash for ownership tracking |

#### Enums

**Category values:**
- `scrap_metal`
- `wood_lumber`
- `tools`
- `electrical`
- `plumbing`
- `containers_storage`
- `building_materials`
- `fuel_energy`
- `other`

**Status values:**
- `available`
- `claimed`
- `possibly_gone`
- `expired`

**Location Accuracy values:**
- `exact`
- `approximate`
- `area_only`

## Indexes

The schema includes several indexes optimized for MVP queries:

### Spatial Index (Most Important)
- `idx_resources_location` - GIST index on `location` geography column for fast nearby searches

### Filter Indexes
- `idx_resources_status` - Single column index on status
- `idx_resources_category` - Single column index on category
- `idx_resources_status_category` - Composite index for combined filtering

### Freshness Indexes
- `idx_resources_created_at` - Descending index for "newest first" sorting
- `idx_resources_updated_at` - Descending index for recent updates
- `idx_resources_expires_at` - Partial index on non-null expiration timestamps

## Functions

### `search_nearby_resources`

Core function for radius-based geospatial search.

**Parameters:**
- `search_lat` (DOUBLE PRECISION) - Search center latitude
- `search_lon` (DOUBLE PRECISION) - Search center longitude
- `radius_meters` (INTEGER, default 5000) - Search radius in meters
- `filter_category` (TEXT, optional) - Filter by category
- `filter_status` (TEXT, optional) - Filter by status
- `result_limit` (INTEGER, default 100) - Maximum results to return

**Returns:**
All resource columns plus `distance_meters`, sorted by distance ascending and then by created_at descending.

**Example usage:**
```sql
-- Find all available tools within 5km of a point
SELECT * FROM search_nearby_resources(
  35.6762, 
  51.4231, 
  5000, 
  'tools', 
  'available'
);
```

## Row Level Security (RLS)

RLS is enabled with three policies for MVP:

1. **Public read access** - Anyone can read non-expired resources
2. **Public insert access** - Anyone can create new resources (anonymous posting)
3. **Update own resources** - Users can update resources matching their device_id_hash

## Triggers

### `update_resources_updated_at`
Automatically updates `updated_at` timestamp on any UPDATE operation.

### `update_resources_location`
Automatically computes the PostGIS `location` geography point from `latitude` and `longitude` on INSERT or UPDATE.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Enable PostGIS

**Option A: Via Supabase Dashboard**
1. Go to Database → Extensions
2. Search for "postgis"
3. Click Enable

**Option B: Via SQL Editor**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Run Migrations

**Option A: Using Supabase CLI** (Recommended)
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Option B: Via Supabase Dashboard**
1. Go to SQL Editor
2. Copy the contents of each migration file in order:
   - `20260616000001_initial_schema.sql`
   - `20260616000002_nearby_search_function.sql`
3. Run each migration

### 4. Update Frontend Configuration

Add your Supabase credentials to `frontend/.env`:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## PostGIS Decision: Enable on Day 1

**Recommendation: Enable PostGIS now (Day 1)**

### Why Now:
- The schema already includes the `location` geography column
- The nearby search function depends on PostGIS
- Core MVP feature (radius search) requires spatial queries
- PostGIS is stable and widely used
- No performance penalty for small datasets
- Easier to start with it than migrate later

### Why Not Wait:
- Waiting until Day 5 would mean:
  - Building temporary non-spatial search (wasted work)
  - Data migration complexity
  - Rewriting queries and functions
  - Higher risk of bugs during migration
  - Delays in testing real geospatial behavior

### Performance Notes:
- PostGIS adds ~2MB to database size
- Spatial queries are fast even with 10,000+ records
- GIST index handles nearby searches efficiently
- MVP scale (hundreds to low thousands of pins) is well within PostGIS sweet spot

## Constraints and Validations

### Built-in Validations

1. **Title**: 3-100 characters
2. **Description**: 10-1000 characters
3. **Contact Method**: 3-200 characters (if provided)
4. **Photo URL**: 10-500 characters (if provided)
5. **Device ID Hash**: Exactly 64 characters (SHA-256 hex output)
6. **Latitude**: -90 to 90 (valid geographic range)
7. **Longitude**: -180 to 180 (valid geographic range)
8. **Category**: Must match enum values
9. **Status**: Must match enum values
10. **Location Accuracy**: Must match enum values

### Application-Level Validations (Recommended)

Add these in the frontend for better UX:

1. **Title**: Trim whitespace, reject empty after trim
2. **Description**: Trim whitespace, suggest line breaks for readability
3. **Contact Method**: Validate format if it looks like email/phone
4. **Photo**: Check file size (target 300-600 KB), validate MIME type
5. **Location**: Warn if coordinates are 0,0 or appear invalid
6. **Duplicate Prevention**: Check for similar title/location before submission

### Future Validations (Post-MVP)

Consider adding later:
- Rate limiting per device_id_hash
- Profanity filtering on title/description
- URL validation for photo_url
- Geofencing to restrict to specific regions
- Minimum distance between pins from same device

## Testing the Schema

### Insert a Test Resource

```sql
INSERT INTO resources (
  title, 
  description, 
  category, 
  status, 
  latitude, 
  longitude,
  location_accuracy
) VALUES (
  'Steel beams and rebar',
  'About 50kg of mixed steel from demolished shed. Free to collect.',
  'scrap_metal',
  'available',
  35.6762,
  51.4231,
  'approximate'
);
```

### Query Nearby Resources

```sql
SELECT 
  title,
  category,
  status,
  distance_meters
FROM search_nearby_resources(
  35.6762,  -- latitude
  51.4231,  -- longitude
  10000,    -- 10km radius
  NULL,     -- all categories
  NULL      -- all statuses
);
```

### Check RLS Policies

```sql
-- View active policies
SELECT * FROM pg_policies WHERE tablename = 'resources';
```

## Migration Files

- `20260616000001_initial_schema.sql` - Core table, indexes, triggers, policies
- `20260616000002_nearby_search_function.sql` - Geospatial search function

## Next Steps (Day 2-3)

1. Connect frontend Supabase client
2. Create TypeScript types matching the schema
3. Build data access functions (create, fetch, search)
4. Test connection from deployed frontend
5. Seed sample data for development

## Maintenance Notes

### Backup Strategy
Supabase automatically handles backups. For local development:
```bash
supabase db dump -f backup.sql
```

### Schema Changes
Add new migrations with incremental timestamps:
```bash
supabase migration new feature_name
```

### Monitoring
Use Supabase Dashboard to monitor:
- Query performance
- Index usage
- RLS policy hits
- Storage size
