# Magpie

## Purpose

Magpie is a hyper-local, peer-to-peer resource map for post-crisis recovery. It helps people find and share useful materials nearby such as scrap metal, tools, wood, electrical parts, plumbing supplies, containers, fuel-related items, and other reusable building resources.

The goal is to support local rebuilding, scavenging, barter-adjacent exchange, and practical reuse in places with weak infrastructure, unreliable power, poor connectivity, and limited access to formal supply chains.

## Description

Magpie lets people drop simple location-based resource pins on a map so others nearby can discover what is available. Each pin describes a useful item or material, its approximate location, its availability status, and an optional contact method.

The app is designed for:
- low bandwidth
- degraded mobile networks
- weak or old devices
- intermittent connectivity
- users who may not have stable email, phone, or accounts

Because of these constraints, the MVP is text-first, lightweight, offline-tolerant, and usable even when maps are slow or unavailable.

## Chosen Stack

### Frontend
- `SvelteKit`
- `TypeScript`
- Minimal local CSS

### Map
- `Leaflet`

### Backend
- `Supabase`

### Database
- `PostgreSQL`
- `PostGIS`

### Offline Storage
- `IndexedDB`
- `Dexie.js`

### PWA / Offline
- `Vite PWA` or SvelteKit service worker

### Image Handling
- Optional client-side compression
- Small image size target: roughly `300-600 KB`

### Hosting
- `Cloudflare Pages` for frontend
- `Supabase` for backend and database

## Why This Stack

This stack is chosen because it is the fastest path to a resilient MVP in 15 days.

- `SvelteKit` is lightweight, fast, and productive for a small team or solo build
- `Leaflet` is simpler and lighter than heavier mapping stacks
- `Supabase + PostGIS` gives fast geospatial queries without building a backend from scratch
- `IndexedDB + Dexie` supports offline drafts and sync queues
- `PWA support` makes the app installable and usable with unreliable connections
- `Cloudflare Pages` keeps deployment simple and low-maintenance

## MVP Scope

The MVP answers one core question:

> What useful materials are near me, are they still available, and how can I find or contact the person who posted them?

### In Scope
- map view of nearby resources
- list view fallback for low bandwidth or failed map tiles
- create resource pin
- geolocation and manual location selection
- radius-based nearby search
- category and status filters
- offline drafts for unsent pins
- sync queue for reconnect behavior
- cached recent results
- optional photo
- optional contact information
- installable PWA
- app shell available offline
- basic freshness handling for old posts
- simple sharing via copy link or native share

### Out of Scope for MVP
- real-time chat
- payments
- crypto
- barter marketplace mechanics
- reputation system
- complex user profiles
- government or NGO data integrations
- route optimization
- advanced inventory systems
- push notifications
- native mobile apps
- AI classification
- full offline tile packs
- end-to-end encrypted messaging
- complex moderation tools
- reporting flows

## Core Features

### 1. Map View
Users can browse nearby resource pins on a lightweight map.

Includes:
- current location if available
- manual browsing if GPS is unavailable
- marker popups with summary details
- simple tap/click interaction

### 2. List View
Users can browse nearby resources in a text-first list.

Includes:
- sort by distance
- sort by newest
- category and status filtering
- fallback when map tiles fail
- offline-friendly browsing of cached results

### 3. Create Resource Pin
Users can add a resource with minimal required information.

Fields include:
- title
- category
- description
- approximate location
- status
- optional contact method
- optional photo

### 4. Nearby Search
Users can search within a small radius from a point.

Includes:
- `1 km`
- `5 km`
- `20 km`
- backend geospatial query
- sorted by distance and freshness

### 5. Offline Drafts and Sync
Users can create pins while offline.

Includes:
- local draft storage
- queued submission
- retry when connection returns
- visible sync state

### 6. Cached Browsing
The app stores recently viewed resources locally.

Includes:
- last fetched nearby resources
- list fallback when offline
- recently opened details available without network

### 7. Pin Freshness
Pins should communicate whether they are still likely to be useful.

Statuses:
- `available`
- `claimed`
- `possibly_gone`
- `expired`

Also includes:
- posted time
- updated time
- visual stale indicators
- deprioritization of old entries

### 8. Simple Sharing
Users can share a resource quickly.

Includes:
- copy link
- native share sheet when supported

### 9. Installable PWA
The app works as a lightweight installable web app.

Includes:
- add to home screen
- offline shell
- online/offline indicator

## Resource Categories

Recommended MVP categories:
- scrap metal
- wood / lumber
- tools
- electrical
- plumbing
- containers / storage
- building materials
- fuel / energy
- other

## Data Model

### `resources`
Primary table for shared materials and items.

Fields:
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
- `device_id_hash`

Notes:
- `latitude` and `longitude` store approximate resource location
- `location_accuracy` helps express exact vs approximate placement
- `device_id_hash` helps with lightweight anonymous ownership or abuse controls later
- `photo_url` is optional
- `expires_at` supports aging out stale pins

### Suggested Status Values
- `available`
- `claimed`
- `possibly_gone`
- `expired`

### Suggested Location Accuracy Values
- `exact`
- `approximate`
- `area_only`

### Local-Only `sync_queue`
Stored in IndexedDB for offline posting.

Fields:
- `local_id`
- `payload`
- `photo_blob`
- `created_at`
- `sync_status`
- `last_error`

### Optional Cached Local Store
Used for offline list/detail browsing.

Possible fields:
- `resource_id`
- `cached_payload`
- `cached_at`
- `last_viewed_at`

## Product Principles

- list-first reliability
- no mandatory account
- text-first and small payloads
- location can be approximate
- offline creation is essential
- graceful degradation for GPS, maps, photos, and connectivity
- low cognitive load and low UI complexity

## Day 15 Success Definition

By Day 15, Magpie is successful if:

- a user can open the app on a phone browser
- the app loads reliably on weak connections
- the user can see nearby resources in both map view and list view
- the user can filter by radius and category
- the user can create a new resource pin with minimal information
- the user can save a pin offline and sync it later
- the user can open recently viewed resources even without connectivity
- the app works as an installable PWA
- deployment is public and stable
- the system is simple enough to test, maintain, and extend after MVP launch

## Exclusions / Future Features

These are intentionally excluded from the MVP and may be added later.

### Communication
- real-time chat
- inbox or threaded messaging
- encrypted messaging

### Market / Trust Features
- payments
- crypto or tokens
- barter offer system
- seller or trader profiles
- reputation and rating systems

### Growth / Platform Features
- push notifications
- advanced search
- saved searches
- favorites synced to cloud
- multilingual system beyond basic prepared labels

### Mapping / Geo Features
- full offline map packs
- route guidance
- travel time estimation
- duplicate detection warnings
- privacy jitter controls per pin
- clustering improvements

### Operations / Admin
- advanced moderation tools
- reporting workflows
- admin dashboard
- analytics dashboard
- anti-spam tooling beyond basic constraints

### Data / Integration
- NGO, municipal, or government feeds
- supply inventory integrations
- import/export pipelines
- AI-assisted categorization


