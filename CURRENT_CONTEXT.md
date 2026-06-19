# CURRENT_CONTEXT

Goal: Show resources geographically on a Leaflet map

Scope:
- Install and configure Leaflet
- Add reusable map component
- Render resource markers
- Add marker popups with title, category, status, age, and View details button
- Add current location button with geolocation fallback
- Keep manual map browsing available

Done:
- Installed Leaflet and @types/leaflet
- Added Leaflet CSS to app.html
- Created SSR-safe ResourceMap.svelte component with dynamic import
- Integrated map component into home page (+page.svelte)
- Map supports manual panning, dragging, and zooming
- Added responsive styling for mobile and desktop

Next:
- Fetch resources with coordinates from database
- Add resource markers to the map

Constraints:
- SvelteKit SSR must not crash because of Leaflet/window/document usage
- Do not change database schema, RLS policies, authentication, or deployment config
- Do not refactor unrelated code
- Keep implementation MVP-simple and maintainable
- Do not auto-request geolocation on page load
- Resource map must still work if geolocation is denied
- Browser-side code must not expose private secrets

Decisions:
- Use Leaflet with OpenStreetMap tiles
- Use a reusable Svelte map component
- Skip resources with missing/invalid coordinates
- Fit map bounds when markers exist; otherwise use a sensible default center/zoom
- Use Svelte 5 $props() runes for component props
- Dynamic import of Leaflet to avoid SSR window/document errors

Files:
- CURRENT_CONTEXT.md
- frontend/package.json
- frontend/src/lib/components/ResourceMap.svelte
- frontend/src/routes/+page.svelte
- frontend/src/app.html
- .gitignore

Skip:
- Authentication changes
- Database/RLS changes
- New backend API unless existing data-loading structure requires it
- Advanced clustering
- Advanced filtering
