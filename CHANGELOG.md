# Magpie Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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

## Roadmap

### Day 2-3: Backend Connection
- Supabase client integration
- ✅ Database schema and policies (completed Day 1)
- Typed data access functions
- Test frontend-backend connection

### Day 4-5: Map View
- Leaflet integration
- Marker rendering
- Geolocation support
- ✅ PostGIS nearby search function (completed Day 1)

### Day 6: List View
- Text-first resource browsing
- Filters and sorting
- Distance calculation
- Local caching

### Day 7: Add Resource
- Form implementation
- Validation
- Location selection
- Online submission

### Day 8-9: Offline Support
- IndexedDB with Dexie.js
- Sync queue
- Retry logic
- Cached browsing

### Day 10-15: Polish and Launch
- Resource detail view
- PWA configuration
- Image handling
- Performance optimization
- Final testing and deployment
