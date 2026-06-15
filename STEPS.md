# Magpie Development Steps

## Goal

Build a working MVP of Magpie in 15 days.

Each day has:
- goals
- tasks
- deliverable

The plan assumes a single focused builder or very small team moving quickly.

---

## Day 1 - Scope and Setup

### Goals
- finalize MVP scope
- initialize the project
- prepare deployment and database foundation

### Tasks
- confirm categories, statuses, and required fields
- document final MVP scope
- initialize `SvelteKit` with `TypeScript`
- add linting and formatting
- create repository structure
- create Supabase project
- enable PostGIS
- create initial `resources` table
- add `.env.example`
- connect repo to deployment target

### Deliverable
- public empty app deployed
- database created with initial `resources` table
- scope and project docs written

---

## Day 2 - App Shell and Navigation

### Goals
- create the base app structure
- make the app usable as a shell

### Tasks
- build base layout
- add navigation: `Map`, `List`, `Add`, `Offline`
- add minimal typography and spacing system
- add loading, error, and empty states
- add online/offline indicator
- keep CSS lightweight and local
- add app title and placeholder pages

### Deliverable
- navigable app shell with placeholder screens

---

## Day 3 - Backend Connection and Models

### Goals
- connect frontend to Supabase
- define app-level types and data access

### Tasks
- add Supabase client
- define typed `Resource` model
- implement create and fetch functions
- add validation rules for resource creation
- create database policies for MVP read/write behavior
- add timestamps and basic constraints
- verify connection from deployed frontend to backend

### Deliverable
- frontend can read and create resource data through backend

---

## Day 4 - Map View

### Goals
- render nearby resources on a map

### Tasks
- install and configure `Leaflet`
- create reusable map component
- render markers from fetched resources
- add marker popup summaries
- add current location button
- handle denied geolocation gracefully
- support manual map movement and browsing

### Deliverable
- working map screen with visible resource markers

---

## Day 5 - Nearby Search with PostGIS

### Goals
- support radius-based geospatial search

### Tasks
- add geography point handling in database
- create spatial index
- implement nearby search query or RPC
- accept center point plus radius input
- support filters for category and status
- sort by distance and freshness
- test with sample seed data

### Deliverable
- backend-powered nearby search working with `1 km`, `5 km`, and `20 km`

---

## Day 6 - List View

### Goals
- create a reliable text-first browsing mode

### Tasks
- build list screen for nearby resources
- show title, category, status, distance, and age
- add sorting by nearest and newest
- add category and status filters
- add stale visuals for old entries
- add clear empty state
- cache fetched list data locally

### Deliverable
- usable list-first browsing experience, including low-bandwidth fallback

---

## Day 7 - Add Resource Flow

### Goals
- let users create a resource pin online

### Tasks
- build add-resource form
- add required fields:
  - title
  - category
  - description
  - status
  - location
- add optional fields:
  - contact method
  - photo
- support current location, dropped pin, or manual approximate location
- validate input
- create success confirmation state
- route to detail page after creation

### Deliverable
- complete online add-resource flow

---

## Day 8 - Offline Drafts and Sync Queue

### Goals
- make resource creation resilient when offline

### Tasks
- add `IndexedDB` with `Dexie.js`
- create local `sync_queue`
- detect offline state and failed submissions
- save pending resources locally
- store optional image blob locally
- add queue states:
  - pending
  - syncing
  - synced
  - failed
- show user confirmation when saved offline

### Deliverable
- users can submit resource pins offline and keep them queued locally

---

## Day 9 - Sync Engine and Retry Handling

### Goals
- sync queued posts automatically when connection returns

### Tasks
- implement queue processor
- retry pending submissions on reconnect
- upload images before final resource create if needed
- handle per-item failures
- show sync progress and errors
- prevent duplicate double-submission where possible
- add manual retry option

### Deliverable
- offline-created resources sync successfully after reconnect

---

## Day 10 - Resource Detail and Sharing

### Goals
- make each resource useful as a standalone record

### Tasks
- create resource detail page
- show full description, location, status, and contact method
- show optional image
- add created and updated timestamps
- add copy-link action
- add native share support if available
- cache opened resource detail locally

### Deliverable
- detailed resource view with sharing and local caching

---

## Day 11 - Cached Browsing and Offline Fallbacks

### Goals
- keep the app useful when network or map tiles fail

### Tasks
- cache recent search results in IndexedDB
- cache app shell with service worker
- allow opening cached list view while offline
- allow opening cached resource details while offline
- detect tile failure and encourage list fallback
- add no-cache and stale-cache empty states

### Deliverable
- app shell works offline and cached browsing is functional

---

## Day 12 - PWA Installation and Performance Pass

### Goals
- make the app installable and reduce payload size

### Tasks
- add web manifest
- configure service worker
- verify add-to-home-screen behavior
- compress assets and optimize bundle
- lazy load heavy map code where possible
- tune image compression path
- reduce unnecessary network requests
- verify acceptable performance on mobile

### Deliverable
- installable PWA with lightweight performance profile

---

## Day 13 - Status Updates, Freshness, and UX Cleanup

### Goals
- make resource freshness clearer and improve day-to-day usability

### Tasks
- support status updates:
  - available
  - claimed
  - possibly_gone
  - expired
- visually distinguish old or stale posts
- deprioritize old entries in results
- improve labels, copy, and empty states
- improve form clarity and error messages
- smooth navigation and loading transitions

### Deliverable
- clearer resource lifecycle and more usable interface

---

## Day 14 - Testing, Fixes, and Deployment Hardening

### Goals
- stabilize the MVP for launch

### Tasks
- test online and offline flows on mobile
- test weak network behavior
- verify geolocation denied flow
- verify list fallback when map is unavailable
- verify queue persistence across refreshes
- fix critical bugs
- clean environment configuration
- confirm production deployment settings
- review database indexes and policies

### Deliverable
- release candidate build with critical bugs resolved

---

## Day 15 - Launch Readiness and Documentation

### Goals
- ship the MVP publicly
- document how it works and how to maintain it
- add Graphify

### Tasks
- run final smoke tests
- seed a few realistic sample resources if appropriate
- confirm public URL works on mobile
- document setup, architecture, and known limitations
- write short usage instructions
- note post-MVP backlog
- tag or mark MVP release state

### Deliverable
- public Magpie MVP launched and documented

---

## Day 15 Success Checklist

By the end of Day 15:

- users can browse nearby resources on map and list
- users can filter by radius, category, and status
- users can create a resource pin
- users can create a resource pin offline
- queued pins sync when connection returns
- recently viewed and fetched content is available offline
- the app installs as a PWA
- the app is publicly deployed
- the core experience works on weak mobile networks

---

## Priority Order If Time Slips

If the schedule gets tight, cut in this order:

### Keep No Matter What
- list view
- nearby search
- add resource online
- simple detail page
- public deployment

### Keep If Possible
- map view
- offline drafts
- queued sync
- cached offline browsing
- PWA installability

### Cut First
- photo upload
- native share support
- status update polish
- richer visual map behavior
- UI polish and animations

---

## Notes for Execution

### Build Philosophy
- prefer plain and reliable over polished and complex
- ship text-first behavior before image-heavy behavior
- make list view dependable before map view feels complete
- keep schemas and UI small enough to change quickly

### Main Risk Areas
- map tile reliability
- mobile geolocation edge cases
- offline queue consistency
- image upload complexity
- deployment config mismatch between local and production

### Daily Rule
Every day should end with:
- something visible working
- something tested manually
- something committed or documented

