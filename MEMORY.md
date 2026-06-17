# Magpie Development Memory

## Work Completed

### Day 1 - Frontend Setup (June 15, 2026)

#### Initialized SvelteKit Project
- Created clean SvelteKit app with TypeScript using `sv create`
- Project located in `frontend/` directory
- Node.js v24.15.0, npm v11.12.1

#### Configured Linting and Formatting
- Installed ESLint with TypeScript and Svelte support
- Installed Prettier with Svelte plugin
- Created `.eslintrc.cjs` with proper parser configuration
- Created `.prettierrc` with project standards
- Added lint and format scripts to package.json

#### Created Folder Structure
- `src/lib/components/` - Reusable Svelte components
- `src/lib/stores/` - Svelte stores for state management
- `src/lib/types/` - TypeScript type definitions
- `src/lib/utils/` - Utility functions and constants
- `src/lib/offline/` - Placeholder for IndexedDB utilities
- `src/routes/map/`, `list/`, `add/`, `offline/` - Route directories

#### Added Type Definitions
- Created `Resource` interface with all fields from schema
- Created `ResourceSummary` for list views
- Defined `ResourceStatus`, `ResourceCategory`, `LocationAccuracy` types
- Created category labels and list utilities

#### Built App Shell
- Created `Header.svelte` with app name and online/offline indicator
- Created `Nav.svelte` with navigation for Map, List, Add, Offline
- Updated `+layout.svelte` with minimal global styles
- Implemented online/offline store using browser events

#### Created Placeholder Pages
- `/` (Map) - Placeholder for interactive map view
- `/list` - Placeholder for text-first list view
- `/add` - Placeholder for resource creation form
- `/offline` - Placeholder for sync queue management
- All pages show context-aware offline state

#### Environment Configuration
- Created `.env.example` with Supabase URL and anon key placeholders
- Updated `.gitignore` to exclude `.env` files

#### Documentation
- Created comprehensive `frontend/README.md` with:
  - Installation instructions
  - Development commands
  - Project structure overview
  - Feature status checklist
  - MVP timeline reference

### Day 1 - Backend Setup (June 16, 2026)

#### Created Supabase Schema and Migrations
- Created `supabase/migrations/` directory structure
- Built initial schema migration with full `resources` table
- Added PostGIS geography column with automatic triggers
- Created nearby search function using PostGIS spatial queries
- Defined all constraints, indexes, and RLS policies for MVP

#### Database Schema Features
- **Core Table**: `resources` with UUID primary key
- **Validation**: CHECK constraints on all text fields and enums
- **Geospatial**: PostGIS `location` geography column with GIST index
- **Triggers**: Auto-update `updated_at` and compute `location` from lat/lon
- **Indexes**: Spatial, status, category, freshness, and composite indexes
- **RLS Policies**: Public read, public insert, device-based update

#### Created Helper Functions
- `search_nearby_resources()` - Radius-based geospatial search with filters
- Supports category and status filtering
- Returns results sorted by distance and freshness
- Configurable radius (default 5km)

#### Documentation and Developer Experience
- Comprehensive `supabase/README.md` with schema reference
- `supabase/QUICKSTART.md` - 10-minute setup guide
- `supabase/seed.sql` - 25+ realistic sample resources for testing
- Detailed explanations of all constraints and validations
- Clear PostGIS decision recommendation (enable Day 1)

#### Key Technical Decisions
- **PostGIS on Day 1**: Enabled immediately to avoid migration complexity
- **Anonymous posting**: MVP allows public resource creation
- **device_id_hash**: SHA-256 tracking for lightweight ownership
- **Enum constraints**: Database-level enforcement of valid categories/statuses
- **Automatic geography**: Triggers compute PostGIS point from lat/lon

## Current State

### What Works
- ✅ SvelteKit dev server runs successfully
- ✅ Navigation between all placeholder pages
- ✅ Online/offline detection and indicator
- ✅ Clean, responsive layout
- ✅ Type-safe resource definitions
- ✅ Linting and formatting configured
- ✅ Complete database schema ready to deploy
- ✅ PostGIS spatial search functions
- ✅ Row Level Security policies configured
- ✅ Sample seed data for testing

### What's Next (Day 2)
- Backend connection with Supabase client
- Install @supabase/supabase-js in frontend
- Typed data access functions
- Test connection from frontend to backend
- Verify migrations in actual Supabase project

## Technical Decisions

### Framework Choice
- **SvelteKit**: Lightweight, fast, productive for MVP timeline
- **TypeScript**: Type safety for rapid development
- **Minimal CSS**: No framework overhead, local styles only

### Project Organization
- File-based routing via SvelteKit conventions
- Shared components in `lib/components/`
- Centralized types in `lib/types/`
- State management via Svelte stores (no external state library)

### Backend Architecture
- **Supabase + PostGIS**: Fast geospatial queries without custom backend
- **Row Level Security**: Database-level permissions for MVP security
- **Automatic timestamps**: Triggers handle updated_at maintenance
- **Computed geography**: PostGIS point auto-computed from lat/lon
- **Migration-based schema**: Version-controlled SQL migrations

### PostGIS Decision
- Enabled immediately (Day 1) instead of waiting until Day 5
- Core MVP feature (radius search) requires spatial queries
- Avoids data migration and query rewrite later
- Minimal overhead for MVP scale (hundreds to thousands of pins)
- GIST index provides fast nearby searches

### Development Philosophy
- Text-first, low-bandwidth optimized
- Offline-tolerant from day one
- List view as reliable fallback for map
- Minimal dependencies for faster load times

## Known Issues
- None yet - basic setup only

## Dependencies Installed
- Core: `@sveltejs/kit`, `svelte`, `vite`
- TypeScript: `typescript`, `svelte-check`
- Linting: `eslint`, `@typescript-eslint/*`, `eslint-plugin-svelte`
- Formatting: `prettier`, `prettier-plugin-svelte`

## Environment
- Development machine: Linux (bash)
- Node version: v24.15.0
- Package manager: npm v11.12.1
