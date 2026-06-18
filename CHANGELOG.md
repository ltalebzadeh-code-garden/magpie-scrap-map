# Magpie Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added (2026-06-19)

#### Resource Status Update Flow + MVP RLS Hardening
- Added focused status update input type: `UpdateResourceStatusInput`
  - file: `frontend/src/lib/types/resource.ts`
  - re-exported via `frontend/src/lib/types/index.ts`
- Added `updateResourceStatus(input)` in `frontend/src/lib/server/resources.ts`
  - validates `id` and `status` with existing lightweight service validation pattern
  - reuses existing `ResourceStatus` values/allow-list
  - updates only status via RPC `public_update_resource_status`
  - returns minimal payload (`id`, `status`, `updated_at`)
- Added list-page server action: `updateStatus`
  - file: `frontend/src/routes/list/+page.server.ts`
  - handles structured success/error responses consistent with current create flow
- Updated list page UI to support per-item status updates
  - file: `frontend/src/routes/list/+page.svelte`
  - adds status selector + update action per resource row
  - surfaces submission success/error feedback
- Added migration: `supabase/migrations/20260619000003_mvp_rls_and_status_update.sql`
  - explicitly enables RLS on `resources`
  - defines explicit anonymous SELECT policy (`anon_read_resources`)
  - defines explicit anonymous INSERT policy (`anon_insert_resources`)
  - intentionally avoids direct anonymous table UPDATE policy
  - adds status-only `SECURITY DEFINER` function `public_update_resource_status`
  - grants execute only to `anon`
  - includes explicit risk notes: direct anonymous updates are unsafe for MVP

### Added (2026-06-18)

#### Resource Data Flows (MVP)
- Added server-side resource service module: `frontend/src/lib/server/resources.ts`
  - `createResource(input)` with lightweight validation and structured result shape
  - `fetchRecentResources(limit)` ordered newest-first (`created_at DESC`)
- Added lightweight server-side validation before inserts:
  - required fields
  - allowed category/status values
  - basic text length checks
  - coordinate range checks for latitude/longitude
- Added list server load route: `frontend/src/routes/list/+page.server.ts`
  - fetches recent resources from Supabase for SSR page data
- Updated list page: `frontend/src/routes/list/+page.svelte`
  - renders recent resources from Supabase
  - surfaces backend load errors with existing `ErrorState`
- Updated add flow wiring:
  - `frontend/src/routes/add/+page.server.ts` uses `createResource`
  - `frontend/src/routes/add/+page.svelte` submits and renders validation/backend feedback

#### Mobile-First Layout
- Mobile-first bottom navigation pattern
- Fixed positioning for navigation at bottom of viewport
- Safe area inset support for devices with notches/home indicators
- Comfortable tap targets (56px mobile, 60px desktop minimum)
- Clear active route highlighting with top border and background tint
- Content padding to prevent navigation overlap
- Touch-optimized scrolling with `-webkit-overflow-scrolling`
- Responsive font sizing across device sizes
- Desktop hover support with `@media (hover: hover)`
- Accessibility improvements with `aria-current` attributes

#### Reusable UI Components
- Created `src/lib/components/ui/` directory for UI primitives
- Button component with primary, secondary, and ghost variants
- Button sizes: small, medium, large with full-width option
- Input component with focus states and mobile optimization
- Textarea component with configurable rows and resize behavior
- Card component with padding variants and hover effects
- Badge component with automatic status and category coloring
- Badge variants: status (available, claimed, possibly_gone, expired)
- Badge variants: category (all 9 resource categories with distinct colors)
- Badge variants: generic (info, warning, success, error)
- Component exports via `ui/index.ts` for clean imports
- Updated Add Resource page with functional form using UI components
- Form validation, character counter, and category preview
- Component showcase section demonstrating all variants

#### App Shell Offline Indicator
- Added `frontend/src/lib/components/OfflineBanner.svelte` to expose connectivity state in the app shell
- Reused existing `isOnline` store from `src/lib/stores/online.ts` (no new store created)
- Offline behavior: show banner message `Offline — changes will be saved locally`
- Online behavior: banner is hidden to keep UI minimal
- Wired `OfflineBanner` into `frontend/src/routes/+layout.svelte` directly below `Header`
- Kept implementation lightweight and mobile-friendly with compact spacing and readable text

#### Reusable Loading/Error States
- Added `frontend/src/lib/components/states/LoadingState.svelte`
  - Optional `message` prop
  - Lightweight spinner-based loading feedback
- Added `frontend/src/lib/components/states/ErrorState.svelte`
  - Required `message` prop
  - Optional retry action via `onRetry`
  - Reuses existing `Button` component for retry CTA
- Added `frontend/src/lib/components/states/index.ts` for grouped exports
- Added usage example on existing placeholder page: `frontend/src/routes/list/+page.svelte`
  - Demonstrates `LoadingState` with custom message
  - Demonstrates `ErrorState` with retry callback and simple demo recovery state

#### CSS Consistency Pass
- Added `frontend/src/app.css` as a minimal global style layer
  - Small design tokens (color, spacing, typography, layout)
  - Reusable page-level utility conventions (`.page-container`, `.section-stack`, `.surface-card`)
- Imported global styles once in `frontend/src/routes/+layout.svelte`
- Updated representative placeholder pages to use shared conventions while keeping local styles:
  - `frontend/src/routes/+page.svelte`
  - `frontend/src/routes/list/+page.svelte`

### Added (2026-06-16)
- Complete Supabase database schema with PostGIS extension
- Initial migration: `resources` table with full constraints and validation
- PostGIS geography column with automatic triggers for spatial queries
- Nearby search function (`search_nearby_resources`) with radius and filters
- GIST spatial index for fast geospatial queries
- B-tree indexes on status, category, timestamps for filtering
- Row Level Security policies (public read, public insert, device-based update)
- Automatic `updated_at` trigger on resource updates
- Automatic `location` geography computation from latitude/longitude
- Sample seed data with 25+ realistic Tehran-area resources
- Comprehensive `supabase/README.md` with schema documentation
- Quick-start guide (`supabase/QUICKSTART.md`) for 10-minute setup
- Database constraints: text lengths, enum values, coordinate ranges
- Support for resource expiration with `expires_at` timestamp
- Device-based ownership tracking via `device_id_hash` (SHA-256)

### Added (2026-06-15)
- Initial SvelteKit frontend project setup
- TypeScript configuration and type definitions
- ESLint and Prettier for code quality
- Project folder structure (components, stores, types, utils, routes)
- Online/offline detection store
- Resource type definitions (Resource, ResourceSummary, status, category)
- Category labels and utilities
- App shell with Header and Nav components
- Responsive layout with minimal CSS
- Placeholder pages for Map, List, Add, and Offline views
- `.env.example` with Supabase configuration placeholders
- Comprehensive frontend README with setup instructions
- Development documentation (MEMORY.md, CHANGELOG.md, PROJECT_STRUCTURE)

### Development Setup
- Node.js v24.15.0
- npm v11.12.1
- SvelteKit v2.63.0
- TypeScript v6.0.3
- PostgreSQL with PostGIS (via Supabase)
- Database migrations in `supabase/migrations/`

