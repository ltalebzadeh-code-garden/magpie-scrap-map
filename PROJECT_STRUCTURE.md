# Magpie Project Structure

## Root Directory

```
magpie/
├── frontend/               # SvelteKit frontend application
├── supabase/               # Database schema and migrations
├── .git/                   # Git repository
├── PROJECT.md              # Project overview and requirements
├── FLOWS.md                # Product flows and user journeys
├── STEPS.md                # 15-day development plan
├── MEMORY.md               # Development progress log
├── CHANGELOG.md            # Version history and changes
├── PROJECT_STRUCTURE.md    # This file
└── README.md               # Project root README
```

## Supabase Structure

```
supabase/
├── migrations/
│   ├── 20260616000001_initial_schema.sql       # Core resources table with PostGIS
│   └── 20260616000002_nearby_search_function.sql # Geospatial search function
├── seed.sql                                     # Sample data for development
├── README.md                                    # Schema documentation and reference
└── QUICKSTART.md                                # 10-minute setup guide
```

## Frontend Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte       # App header with title and status
│   │   │   └── Nav.svelte          # Main navigation component
│   │   ├── stores/
│   │   │   ├── online.ts           # Online/offline state store
│   │   │   └── index.ts            # Store exports
│   │   ├── types/
│   │   │   ├── resource.ts         # Resource type definitions
│   │   │   └── index.ts            # Type exports
│   │   ├── utils/
│   │   │   ├── categories.ts       # Category labels and lists
│   │   │   └── index.ts            # Utility exports
│   │   ├── offline/
│   │   │   └── README.md           # Placeholder for IndexedDB utilities
│   │   ├── index.ts                # Main lib exports
│   │   └── assets/
│   │       └── favicon.svg         # App favicon
│   ├── routes/
│   │   ├── map/                    # Map view route (future)
│   │   ├── list/
│   │   │   └── +page.svelte        # List view page
│   │   ├── add/
│   │   │   └── +page.svelte        # Add resource page
│   │   ├── offline/
│   │   │   └── +page.svelte        # Offline queue page
│   │   ├── +layout.svelte          # Root layout with header/nav
│   │   └── +page.svelte            # Home page (map view)
│   ├── app.html                    # HTML template
│   └── app.d.ts                    # App-level TypeScript definitions
├── static/                         # Static assets
├── node_modules/                   # Dependencies (gitignored)
├── .svelte-kit/                    # SvelteKit build artifacts (gitignored)
├── .eslintrc.cjs                   # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .prettierignore                 # Prettier ignore patterns
├── .gitignore                      # Git ignore patterns
├── .env.example                    # Environment variables template
├── .env                            # Local environment (gitignored)
├── package.json                    # Project dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # Frontend documentation
```

## Key Files

### Database Schema
- `supabase/migrations/20260616000001_initial_schema.sql` - Resources table, triggers, indexes, RLS
- `supabase/migrations/20260616000002_nearby_search_function.sql` - Geospatial search
- `supabase/seed.sql` - Sample test data (25+ resources)
- `supabase/README.md` - Complete schema reference and documentation
- `supabase/QUICKSTART.md` - Backend setup guide

### Configuration
- `frontend/package.json` - Dependencies, scripts, project metadata
- `frontend/tsconfig.json` - TypeScript compiler options
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/.eslintrc.cjs` - ESLint rules and parser config
- `frontend/.prettierrc` - Code formatting rules

### Type Definitions
- `frontend/src/lib/types/resource.ts` - Core resource data types
  - `Resource` interface
  - `ResourceSummary` interface
  - `ResourceStatus`, `ResourceCategory`, `LocationAccuracy` types

### Components
- `frontend/src/lib/components/Header.svelte` - App header with online indicator
- `frontend/src/lib/components/Nav.svelte` - Navigation tabs

### Routes (Pages)
- `frontend/src/routes/+page.svelte` - Map view (home)
- `frontend/src/routes/list/+page.svelte` - List view
- `frontend/src/routes/add/+page.svelte` - Add resource form
- `frontend/src/routes/offline/+page.svelte` - Offline queue

### Stores
- `frontend/src/lib/stores/online.ts` - Online/offline state detection

### Utilities
- `frontend/src/lib/utils/categories.ts` - Category labels and constants

## Development Status

### ✅ Completed
- Project initialization
- Folder structure
- Type definitions
- Basic routing
- App shell components
- Online/offline detection
- Placeholder pages
- Complete database schema with PostGIS
- Spatial indexes and search functions
- Row Level Security policies
- Sample seed data
- Backend documentation

