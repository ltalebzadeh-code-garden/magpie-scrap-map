# Magpie Database Schema Summary

Quick reference for the Magpie MVP database structure.

## Resources Table

**Purpose**: Store all user-posted resource pins

**Primary Key**: `id` (UUID)

**Required Fields**:
- `title` (3-100 chars)
- `description` (10-1000 chars)
- `category` (enum)
- `status` (enum, default: 'available')
- `latitude` (-90 to 90)
- `longitude` (-180 to 180)

**Optional Fields**:
- `location_accuracy` (enum, default: 'approximate')
- `contact_method` (3-200 chars)
- `photo_url` (10-500 chars)
- `expires_at` (timestamp)
- `device_id_hash` (64 chars, SHA-256)

**Auto-Generated**:
- `id` (UUID)
- `created_at` (timestamp)
- `updated_at` (timestamp, auto-updated)
- `location` (PostGIS geography, computed from lat/lon)

## Enums

**Categories**: scrap_metal, wood_lumber, tools, electrical, plumbing, containers_storage, building_materials, fuel_energy, other

**Statuses**: available, claimed, possibly_gone, expired

**Location Accuracy**: exact, approximate, area_only

## Key Functions

### `search_nearby_resources(lat, lon, radius, category?, status?, limit?)`

Returns resources within radius (meters) sorted by distance.

**Example**:
```sql
SELECT * FROM search_nearby_resources(35.7, 51.4, 5000, 'tools', 'available');
```

## Indexes

- **Spatial**: GIST on `location` (critical for nearby search)
- **Filters**: B-tree on `status`, `category`, composite on both
- **Freshness**: B-tree on `created_at`, `updated_at` (descending)
- **Expiration**: Partial on `expires_at`

## Security

**RLS Enabled** with three policies:
1. Public read (non-expired only)
2. Public insert (anonymous posting)
3. Device-based update (via device_id_hash match)

## Triggers

1. **Auto-update timestamp**: Sets `updated_at` on UPDATE
2. **Auto-compute location**: Creates PostGIS point from lat/lon

## Column Sizes

Use these constraints in frontend validation:

- Title: 3-100 characters
- Description: 10-1000 characters
- Contact: 3-200 characters
- Photo URL: 10-500 characters
- Device hash: exactly 64 characters (SHA-256 hex)

## Migration Files

Run in order:
1. `20260616000001_initial_schema.sql`
2. `20260616000002_nearby_search_function.sql`

## Quick Test Queries

```sql
-- Count resources
SELECT COUNT(*) FROM resources;

-- Test spatial search
SELECT title, category, distance_meters 
FROM search_nearby_resources(35.7, 51.4, 10000) 
LIMIT 5;

-- View by category
SELECT category, COUNT(*) 
FROM resources 
GROUP BY category 
ORDER BY count DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'resources';

-- Verify PostGIS
SELECT PostGIS_version();
```

## Common Queries for Frontend

### Nearby search with filters
```sql
SELECT * FROM search_nearby_resources(
  35.6762,  -- user latitude
  51.4231,  -- user longitude
  5000,     -- 5km radius
  'tools',  -- category filter (or NULL)
  'available' -- status filter (or NULL)
) LIMIT 50;
```

### Insert new resource
```sql
INSERT INTO resources (
  title, description, category, status,
  latitude, longitude, location_accuracy,
  contact_method
) VALUES (
  'Hand tools set',
  'Wrenches and screwdrivers, some rust but functional',
  'tools',
  'available',
  35.7298,
  51.4145,
  'approximate',
  'Knock on blue gate'
) RETURNING *;
```

### Update resource status
```sql
UPDATE resources 
SET status = 'claimed'
WHERE id = 'uuid-here'
RETURNING *;
```

### Fetch single resource
```sql
SELECT * FROM resources WHERE id = 'uuid-here';
```
