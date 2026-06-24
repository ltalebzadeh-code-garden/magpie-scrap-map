# Offline Utilities

Offline persistence foundation for resource creation queueing.

## Modules

- `db.ts`
  - Dexie-backed IndexedDB setup (`magpie-offline`)
  - Defines `pendingPosts` schema and queue model types:
    - `PendingResourceCreatePayload`
    - `PendingPhotoReference`
    - `PendingResourcePost`
    - `PendingPostSyncStatus`
- `sync-queue.ts`
  - Queue storage helpers:
    - `addPendingPost`
    - `listPendingPosts`
    - `updatePendingPostSyncState`
    - `removePendingPost`

## Notes

- This is the **single** queue/storage contract for pending resource posts.
- Submission branching and sync orchestration are intentionally deferred to later parts.
- Existing nearby-search cache remains in `src/lib/utils/nearby-cache.ts` and is separate from this queue.
