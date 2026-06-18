# CURRENT_CONTEXT

Goal: Connect frontend to Supabase and support first working resource create/fetch flows without map integration

Scope:
- set up Supabase client
- align DB-facing resource types
- add resource create/fetch functions
- add simple server-side validation
- wire one existing page/form to demonstrate flows

Done:
- SvelteKit app shell exists
- placeholder pages exist
- online/offline store exists
- base resource/category/status types exist
- category labels/utilities exist
- `CreateResourceInput` type added and exported
- Supabase JS client added to frontend dependencies
- reusable server data layer added at `frontend/src/lib/server/resources.ts`
- `createResource` implemented with:
  - required field validation
  - category/status allow-list validation
  - basic text length checks
  - coordinate range checks
  - structured result shape (`{ ok, data } | { ok, error }`)
- `fetchRecentResources` implemented ordered by `created_at DESC`
- Add form wired to server action (`frontend/src/routes/add/+page.server.ts`)
- Add page now posts to server action and renders success/validation errors
- List page wired to server load (`frontend/src/routes/list/+page.server.ts`)
- List page now renders recent resources from Supabase (no map integration)

Next:
- optional: align remaining Svelte 5 warnings in pre-existing/shared files
- optional: add DB type generation for stricter Supabase typing (remove temporary cast in insert)
- optional: implement status update flow (separate task)
- optional: define anti-spam and rate-limit strategy in backend edge layer

Constraints:
- keep MVP minimal and understandable
- prefer existing patterns over new abstractions
- do not add map integration
- do not rebuild existing shell/UI unless needed for testing
- anonymous read/insert is expected for MVP
- avoid unsafe anonymous update policy unless clearly justified
- keep validation lightweight and easy to extend

Key Decisions:
- stack: SvelteKit + Supabase/PostGIS + IndexedDB/Dexie + Cloudflare Pages
- Graphify is out of scope
- Data API enabled
- Automatic RLS enabled
- Automatically expose new tables disabled

Files:
- frontend/src/lib/types/resource.ts
- frontend/src/lib/types/index.ts
- frontend/src/lib/server/supabase.ts
- frontend/src/lib/server/resources.ts
- frontend/src/routes/add/+page.server.ts
- frontend/src/routes/add/+page.svelte
- frontend/src/routes/list/+page.server.ts
- frontend/src/routes/list/+page.svelte

Skip:
- do not recreate existing routes/components/types unless needed
- do not add auth flows today
- do not add map features today
- do not overengineer the service layer

