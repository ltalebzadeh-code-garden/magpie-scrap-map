# Magpie

Magpie is a lightweight, hyper-local resource map for post-crisis recovery. It helps people discover and share useful nearby materials such as tools, scrap metal, wood, electrical parts, plumbing supplies, containers, fuel-related items, and other reusable building resources.

## Purpose

Magpie answers a simple operational question:

What useful materials are near me, are they still available, and how can I find them?

## Stack

- Frontend: `SvelteKit`, `TypeScript`
- Mapping: `Leaflet`
- Backend: `Supabase`
- Database: `PostgreSQL`, `PostGIS`
- Offline storage: `IndexedDB`, `Dexie`
- PWA/offline support: service worker / web app manifest
- Hosting target: `Cloudflare Pages` + `Supabase`

## MVP Scope

In scope:

- nearby resource discovery
- map view and list fallback
- create resource pins
- radius, category, and status filtering
- optional photo and contact method
- offline drafts and queued sync
- cached recent results
- freshness/status handling
- installable PWA behavior

Out of scope for the MVP:

- chat or messaging
- payments or barter workflows
- user profiles or reputation
- advanced moderation/admin tooling
- native mobile apps
- complex analytics/integrations
- full multilingual infrastructure

## Core Functionality

- Browse nearby resources on a map
- Fall back to a text-first list view when needed
- Add a resource with minimal required information
- Search by proximity using PostGIS
- Mark resource status over time
- Save work offline and sync later
- Reopen recently viewed data with limited connectivity

## Repository Guide

This repository is organized into two main parts:

- `frontend/` - SvelteKit application
- `supabase/` - database schema, migrations, and backend setup

For more detailed documentation, see:

- `FLOWS.md` - user flows and product behavior
- `PROJECT_STRUCTURE.md` - repository and module layout
- `supabase/SCHEMA_SUMMARY` - schema documentation
- `supabase/QUICKSTART.md` - Supabase setup
- `frontend/README.md` - frontend-specific notes

## Current Direction

The current MVP favors:

- low operational complexity
- small payloads
- graceful degradation
- anonymous or lightweight participation
- minimal infrastructure beyond what is needed for reliable local use

## Future Requirements

Likely next-stage requirements include:

- stronger moderation and anti-spam controls
- better freshness and expiry workflows
- improved offline sync resilience
- clearer ownership/update flows
- multilingual support if there is proven product need
- more robust map/list performance on weak networks

## Status

Magpie is an MVP-focused build centered on resilient local discovery and posting of reusable resources, with geospatial search, offline tolerance, and a lightweight web delivery model.

