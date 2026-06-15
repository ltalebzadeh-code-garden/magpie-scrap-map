# Magpie Product Flows

## Overview

Magpie is designed around a small number of critical product flows. Each flow should be fast, low-bandwidth, and tolerant of weak connectivity.

The main flows are:
- browse nearby resources
- search and filter resources
- view a resource detail
- create a resource pin
- create a resource pin while offline
- sync queued pins when back online
- browse cached resources offline
- share a resource

---

## 1. Browse Nearby Resources

### Goal
Let a user quickly discover useful materials near their location.

### Entry Points
- app home
- map tab
- list tab

### User Actions
- open the app
- allow location access, or skip it
- view nearby resources on map
- switch to list view if preferred
- move the map manually if GPS is unavailable

### System Behavior
- detect online/offline state
- request geolocation if supported
- fall back to manual browsing if denied or unavailable
- fetch nearby resources from backend
- show map pins and/or list items
- cache fetched results locally

### Data Required
- current latitude and longitude, if available
- selected search radius
- category filter, if any
- status filter, if any
- fetched resource summaries:
  - `id`
  - `title`
  - `category`
  - `status`
  - `latitude`
  - `longitude`
  - `created_at`
  - optional distance value

---

## 2. Search and Filter Resources

### Goal
Help the user narrow nearby resources to useful results.

### User Actions
- choose radius: `1 km`, `5 km`, or `20 km`
- filter by category
- filter by status
- sort by nearest or newest

### System Behavior
- apply filters to backend search when online
- use cached data if offline
- update visible results in map and list views
- preserve active filter state locally during session

### Data Required
- search center point
- radius
- category
- status
- sort mode
- cached or fetched resource set

---

## 3. View Resource Detail

### Goal
Let the user inspect a single resource and decide whether it is worth pursuing.

### User Actions
- tap a marker or list item
- read description
- check availability status
- view approximate location
- view optional contact method
- view optional image
- share the resource link

### System Behavior
- open detail screen
- show full record if available
- cache detail locally for offline revisit
- display stale or expired state clearly

### Data Required
- `id`
- `title`
- `description`
- `category`
- `status`
- `latitude`
- `longitude`
- `location_accuracy`
- `contact_method`
- `photo_url`
- `created_at`
- `updated_at`
- `expires_at`

---

## 4. Create Resource Pin

### Goal
Allow a user to post a useful nearby resource quickly with minimal friction.

### User Actions
- open add screen
- enter title
- select category
- enter short description
- choose status
- choose location:
  - current location
  - drop pin on map
  - set approximate area manually
- optionally add contact method
- optionally attach photo
- submit

### System Behavior
- validate required fields
- compress image if present
- create payload
- send to backend if online
- show success state and detail link if submission succeeds

### Required Data
- `title`
- `category`
- `description`
- `status`
- `latitude`
- `longitude`

### Optional Data
- `location_accuracy`
- `contact_method`
- `photo_url` or image blob pending upload
- `expires_at`

### Validation Rules
- title required
- category required
- description required
- status required
- location required
- keep text field lengths small and reasonable
- image optional

---

## 5. Create Resource Pin While Offline

### Goal
Allow the user to record a resource even when no connection is available.

### User Actions
- fill add form without connectivity
- submit form
- optionally continue using app

### System Behavior
- detect offline state or failed request
- store pending submission in local sync queue
- preserve photo blob locally if attached
- mark the submission as `pending`
- show confirmation that the pin is saved locally and will sync later

### Data Required
Stored in local queue:
- `local_id`
- `payload`
- `photo_blob`
- `created_at`
- `sync_status`
- `last_error`

### User Feedback
- clear offline badge
- local save confirmation
- queued sync state
- retry behavior after reconnection

---

## 6. Sync Queued Pins

### Goal
Move locally queued submissions to the backend when connectivity returns.

### Trigger
- app regains network
- user manually retries sync
- app launches while online

### User Actions
- wait for automatic sync, or
- tap retry

### System Behavior
- read pending queue from IndexedDB
- upload oldest pending item first
- upload photo if needed
- create resource record in backend
- mark queue item as `synced` on success
- keep failed items with error state for retry

### Data Required
From local queue:
- `local_id`
- `payload`
- `photo_blob`
- `sync_status`
- `last_error`

### Edge Cases
- duplicate submission after partial failure
- photo upload failure
- expired session or invalid backend config
- partial sync with some items succeeding and others failing

---

## 7. Browse Cached Resources Offline

### Goal
Ensure the app remains useful even when the map or network is unavailable.

### User Actions
- open app while offline
- browse recent list results
- open previously viewed resource details

### System Behavior
- load app shell from service worker cache
- show offline indicator
- load cached resource list from IndexedDB
- allow detail view for cached records
- degrade gracefully if no cache exists

### Data Required
Local cached data:
- recent resource list
- resource details
- timestamps for cache freshness

### Fallback Behavior
If map tiles do not load:
- default to list-first mode
- continue to show text content
- preserve filtering where possible on cached set

---

## 8. Share a Resource

### Goal
Help users pass along useful resource information quickly.

### User Actions
- tap share
- choose native share if supported
- otherwise copy link

### System Behavior
- generate stable route for resource detail
- trigger native share sheet when available
- fall back to clipboard copy

### Data Required
- `id`
- `title`
- route or public URL

---

## 9. Basic Status Update Flow

### Goal
Allow a resource to reflect changing availability over time.

### User Actions
- open resource
- mark as:
  - `claimed`
  - `possibly_gone`
  - `expired`

### System Behavior
- update backend record
- refresh detail and nearby results
- deprioritize stale or unavailable items in list ordering

### Data Required
- `id`
- `status`
- `updated_at`

---

## Data Required by Screen

### Map Screen
- current or selected location
- nearby resource summaries
- filter state
- tile availability state
- online/offline state

### List Screen
- nearby resource summaries
- distance values
- filter state
- sort mode
- online/offline state

### Add Screen
- form values
- image file or blob
- geolocation or selected map point
- validation errors
- sync state

### Detail Screen
- full resource record
- cached state
- share URL

### Offline / Saved Screen
- queued posts
- cached resources
- sync errors
- retry controls

---


