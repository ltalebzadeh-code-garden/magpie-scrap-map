# CURRENT_CONTEXT

Goal: Implement MVP resource status update flow and define minimal, explicit RLS posture

Scope:
- add focused resource status update function (status-only path)
- reuse existing status types and validation patterns
- wire minimal status update action from list flow
- define explicit MVP RLS SQL policies (anon read + anon insert)
- avoid unsafe direct anonymous table update policy

Done:
- Existing create/fetch flows retained as-is
- `UpdateResourceStatusInput` type added and exported
- `updateResourceStatus(input)` implemented in `frontend/src/lib/server/resources.ts`
  - focused input shape (`id`, `status`)
  - status allow-list reuse (`ResourceStatus` values)
  - lightweight validation (required + UUID format + status validity)
  - calls `public_update_resource_status` RPC and returns `{ id, status, updated_at }`
- List route server action added: `updateStatus` in `frontend/src/routes/list/+page.server.ts`
  - reuses existing structured service result and validation error pattern
- List page UI updated (`frontend/src/routes/list/+page.svelte`)
  - per-row status update form posting to `?/updateStatus`
  - success/error feedback rendering
- New migration added: `supabase/migrations/20260619000003_mvp_rls_and_status_update.sql`
  - explicitly enables RLS
  - explicit anon SELECT policy
  - explicit anon INSERT policy
  - removes direct table UPDATE policy for anon
  - adds status-only `SECURITY DEFINER` function `public_update_resource_status`
  - documents risks of direct anonymous updates and safer temporary alternative

Next:
- recommended follow-up: add lightweight ownership token/device hash check to status-update RPC
- recommended follow-up: add anti-spam/rate-limiting edge checks for anon insert/update endpoints
- optional: align remaining pre-existing Svelte warnings unrelated to this task

Constraints:
- keep MVP minimal and understandable
- prefer existing patterns over new abstractions
- do not add map integration
- do not rebuild existing shell/UI unless needed for testing
- anonymous read/insert is expected for MVP
- direct anonymous table UPDATE policy is considered unsafe and intentionally avoided
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
- supabase/migrations/20260619000003_mvp_rls_and_status_update.sql

Skip:
- do not recreate existing routes/components/types unless needed
- do not add auth flows today
- do not add map features today
- do not overengineer the service layer

