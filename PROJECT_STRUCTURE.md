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
│   ├── 20260616000002_nearby_search_function.sql # Geospatial search function
│   └── 20260619000003_mvp_rls_and_status_update.sql # MVP RLS policies + status update function
├── seed.sql                                     # Sample data for development
├── README.md                                    # Schema documentation and reference
└── QUICKSTART.md                                # 10-minute setup guide
```

## Frontend Structure

```
frontend/
├── src/
│   ├── app.css                     # Global design tokens and page-level utility conventions
│   ├── lib/
│   │   ├── components/
│   │   │   ├── states/
│   │   │   │   ├── LoadingState.svelte # Reusable loading state UI
│   │   │   │   ├── ErrorState.svelte   # Reusable error state UI with optional retry
│   │   │   │   └── index.ts            # State component exports
│   │   │   ├── ui/
│   │   │   │   ├── Button.svelte       # Reusable button component
│   │   │   │   ├── Input.svelte        # Text input component
│   │   │   │   ├── Textarea.svelte     # Multi-line text input
│   │   │   │   ├── Card.svelte         # Card container component
│   │   │   │   ├── Badge.svelte        # Status/category badge component
│   │   │   │   └── index.ts            # UI component exports
│   │   │   ├── ResourceMap.svelte  # SSR-safe Leaflet map component
│   │   │   ├── Header.svelte       # App header with title and status
│   │   │   ├── OfflineBanner.svelte # Connectivity banner shown when offline
│   │   │   └── Nav.svelte          # Main navigation component
│   │   ├── stores/
│   │   │   ├── online.ts           # Online/offline state store
│   │   │   └── index.ts            # Store exports
│   │   ├── types/
│   │   │   ├── resource.ts         # Resource type definitions
│   │   │   └── index.ts            # Type exports
│   │   ├── utils/
│   │   │   ├── time.ts             # Time formatting and HTML escaping utilities
│   │   │   ├── categories.ts       # Category labels and lists
│   │   │   └── index.ts            # Utility exports
│   │   ├── server/
│   │   │   ├── supabase.ts         # Supabase server client initialization
│   │   │   └── resources.ts        # Resource data access + validation service
│   │   ├── offline/
│   │   │   └── README.md           # Placeholder for IndexedDB utilities
│   │   ├── index.ts                # Main lib exports
│   │   └── assets/
│   │       └── favicon.svg         # App favicon
│   ├── routes/
│   │   ├── map/                    # Map view route (future)
│   │   ├── list/
│   │   │   ├── +page.server.ts     # Server load for recent resources
│   │   │   └── +page.svelte        # List view page
│   │   ├── add/
│   │   │   ├── +page.server.ts     # Server action for resource creation
│   │   │   └── +page.svelte        # Add resource page
│   │   ├── offline/
│   │   │   └── +page.svelte        # Offline queue page
│   │   ├── +layout.svelte          # Root layout with header/nav
│   │   ├── +page.svelte            # Home page (map view)
│   │   └── +page.server.ts         # Server load for map resources
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
- `supabase/migrations/20260619000003_mvp_rls_and_status_update.sql` - Explicit MVP RLS policies + status-only public update function
- `supabase/seed.sql` - Sample test data (25+ resources)
- `supabase/README.md` - Complete schema reference and documentation
- `supabase/QUICKSTART.md` - Backend setup guide

### Configuration
- `frontend/package.json` - Dependencies, scripts, project metadata
- `frontend/tsconfig.json` - TypeScript compiler options
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/.eslintrc.cjs` - ESLint rules and parser config
- `frontend/.prettierrc` - Code formatting rules
- `frontend/src/app.css` - Global tokens (color/spacing/typography/layout) and shared page-level utilities

### Type Definitions
- `frontend/src/lib/types/resource.ts` - Core resource data types
  - `Resource` interface
  - `ResourceSummary` interface
  - `ResourceStatus`, `ResourceCategory`, `LocationAccuracy` types

### UI Components
- `frontend/src/lib/components/ui/Button.svelte` - Reusable button (primary, secondary, ghost)
- `frontend/src/lib/components/ui/Input.svelte` - Text input with focus states
- `frontend/src/lib/components/ui/Textarea.svelte` - Multi-line text input
- `frontend/src/lib/components/ui/Card.svelte` - Container with padding variants
- `frontend/src/lib/components/ui/Badge.svelte` - Status/category badges with auto-coloring
- `frontend/src/lib/components/ui/index.ts` - Centralized UI exports

### Components
- `frontend/src/lib/components/Header.svelte` - App header with online indicator
- `frontend/src/lib/components/OfflineBanner.svelte` - Offline message banner in app shell
- `frontend/src/lib/components/Nav.svelte` - Navigation tabs
- `frontend/src/lib/components/states/LoadingState.svelte` - Minimal loading state with optional message
- `frontend/src/lib/components/states/ErrorState.svelte` - Error state with message and optional retry action
- `frontend/src/lib/components/states/index.ts` - Centralized state component exports

### Routes (Pages)
- `frontend/src/routes/+page.svelte` - Map view (home)
- `frontend/src/routes/list/+page.svelte` - List view + state component usage example
- `frontend/src/routes/list/+page.server.ts` - Server load for recent resources
- `frontend/src/routes/add/+page.svelte` - Add resource form
- `frontend/src/routes/add/+page.server.ts` - Server action for creating resources
- `frontend/src/routes/offline/+page.svelte` - Offline queue

### Stores
- `frontend/src/lib/stores/online.ts` - Online/offline state detection

### Utilities
- `frontend/src/lib/utils/categories.ts` - Category labels and constants

### Server Data Layer
- `frontend/src/lib/server/supabase.ts` - Supabase server client setup
- `frontend/src/lib/server/resources.ts` - Create/fetch resource data functions + validation

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
