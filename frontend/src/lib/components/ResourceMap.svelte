<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type L from 'leaflet';
  import type { ResourceSummary } from '$lib/types';

  interface Props {
    center?: [number, number];
    zoom?: number;
    resources?: ResourceSummary[];
  }

  let { center = [51.505, -0.09], zoom = 13, resources = [] }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let markersLayer: L.LayerGroup | null = null;
  let leaflet: typeof L | null = null;

  onMount(async () => {
    // Dynamic import to avoid SSR issues
    leaflet = await import('leaflet');
    
    // Initialize map
    map = leaflet.map(mapContainer, {
      center,
      zoom,
      zoomControl: true
    });

    // Add OpenStreetMap tiles
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Initialize markers layer
    markersLayer = leaflet.layerGroup().addTo(map);

    // Render initial markers
    updateMarkers();
  });

  $effect(() => {
    // Re-render markers when resources change
    if (map && leaflet && markersLayer) {
      updateMarkers();
    }
  });

  function updateMarkers() {
    if (!map || !leaflet || !markersLayer) return;

    // Clear existing markers
    markersLayer.clearLayers();

    // Filter valid resources with coordinates
    const validResources = resources.filter(
      (r) =>
        r &&
        typeof r.latitude === 'number' &&
        typeof r.longitude === 'number' &&
        !isNaN(r.latitude) &&
        !isNaN(r.longitude) &&
        r.latitude >= -90 &&
        r.latitude <= 90 &&
        r.longitude >= -180 &&
        r.longitude <= 180
    );

    // Add markers for valid resources
    validResources.forEach((resource) => {
      const marker = leaflet!.marker([resource.latitude, resource.longitude]);
      marker.addTo(markersLayer!);
    });

    // Fit bounds if we have markers
    if (validResources.length > 0) {
      const bounds = leaflet.latLngBounds(validResources.map((r) => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  onDestroy(() => {
    // Clean up map instance
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  @media (min-width: 768px) {
    .map-container {
      min-height: 500px;
    }
  }
</style>
