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

### Day 2 - Mobile-First Layout Refinement (June 18, 2026)

#### Refined App Shell for Mobile-First UX
- **Bottom Navigation**: Moved `Nav.svelte` from top to bottom of layout
- **Fixed Positioning**: Navigation now fixed at bottom with `z-index: 1000`
- **Safe Area Support**: Added `env(safe-area-inset-bottom)` for devices with notches
- **Comfortable Tap Targets**: Minimum 56px height on mobile, 60px on desktop
- **No Content Overlap**: Main content has 5rem bottom padding for nav clearance
- **Active Route Highlighting**: Clear visual indicator with top border and background tint
- **Responsive Font Sizing**: Scales from 0.8125rem (small phones) to 0.9375rem (desktop)
- **Touch Optimizations**: 
  - Removed iOS tap highlight with `-webkit-tap-highlight-color: transparent`
  - Added `:active` press feedback with subtle scale transform
  - Smooth scrolling with `-webkit-overflow-scrolling: touch`
- **Desktop Hover Support**: Uses `@media (hover: hover)` to avoid hover issues on touch devices
- **Accessibility**: Added `aria-current="page"` for screen readers

#### Layout Improvements
- **Dynamic Viewport Height**: Uses `100dvh` for proper mobile browser height handling
- **Scrollable Main Area**: Main content scrolls independently with touch-optimized overflow
- **Flexible Desktop Layout**: Maintains centered max-width layout on larger screens

### Day 2 - Reusable UI Components (June 18, 2026)

#### Created UI Component Library
- **New Directory**: `src/lib/components/ui/` for reusable UI primitives
- **Button Component**: 
  - Variants: primary, secondary, ghost
  - Sizes: small, medium, large
  - Full-width option
  - Disabled state support
  - Accessible focus styles
- **Input Component**:
  - Standard text input with multiple type support
  - Focus states with blue border and shadow
  - 16px font size on mobile (prevents iOS zoom)
  - Placeholder and disabled state styling
- **Textarea Component**:
  - Multi-line text input
  - Configurable rows and resize behavior
  - Consistent styling with Input component
- **Card Component**:
  - Padding variants: none, small, medium, large
  - Optional hover effect with elevation
  - Clickable variant with press feedback
  - Keyboard accessibility
- **Badge Component**:
  - Automatic status badge coloring (available, claimed, possibly_gone, expired)
  - Category badge support with distinct colors per category
  - Generic variants: info, warning, success, error
  - Two sizes: small and medium
  - Auto-displays labels for status/category types

#### Updated Add Resource Page
- Implemented working form using new UI components
- Live character counter for description field
- Category preview with Badge component
- Offline notice with warning badge
- Component showcase section demonstrating all variants
- Form validation states

### Day 2 - App Shell Connectivity Banner (June 18, 2026)

#### Integrated Existing Online/Offline Store into Layout UI
- Added new `frontend/src/lib/components/OfflineBanner.svelte`
- Reused existing `isOnline` store from `src/lib/stores/online.ts` (no new connectivity store created)
- Banner behavior:
  - **Offline**: shows `Offline — changes will be saved locally`
  - **Online**: hidden for minimal UI noise
- Mobile-friendly styling:
  - compact text size and padding
  - centered content with safe wrapping behavior
  - sticky placement below header so state is clearly visible while scrolling
- Wired banner into app shell in `frontend/src/routes/+layout.svelte` directly under `<Header />`

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
- ✅ Mobile-first bottom navigation with fixed positioning
- ✅ Comfortable tap targets and clear active states
- ✅ Content padding prevents nav overlap
- ✅ Reusable UI component library (Button, Input, Textarea, Card, Badge)
- ✅ App-shell offline banner using existing connectivity store

### What's Next
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
