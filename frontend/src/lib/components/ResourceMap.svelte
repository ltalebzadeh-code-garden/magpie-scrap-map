<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type L from 'leaflet';
  import type { ResourceSummary } from '$lib/types';
  import { categoryLabels, formatRelativeTime, escapeHtml } from '$lib/utils';

  type LocationState = 'idle' | 'loading' | 'success' | 'error';

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
  let userLocationMarker: L.CircleMarker | null = null;
  let locationState = $state<LocationState>('idle');
  let locationError = $state<string>('');

  const statusLabels: Record<string, string> = {
    available: 'Available',
    claimed: 'Claimed',
    possibly_gone: 'Possibly Gone',
    expired: 'Expired'
  };

  function createPopupContent(resource: ResourceSummary): string {
    const title = escapeHtml(resource.title);
    const category = categoryLabels[resource.category] || 'Unknown';
    const status = statusLabels[resource.status] || resource.status;
    const age = formatRelativeTime(resource.created_at);

    return `
      <div style="font-family: sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #2d3748;">${title}</h3>
        <div style="margin: 4px 0; font-size: 14px; color: #4a5568;">
          <div style="margin: 2px 0;"><strong>Category:</strong> ${category}</div>
          <div style="margin: 2px 0;"><strong>Status:</strong> ${status}</div>
          <div style="margin: 2px 0; color: #718096;">${age}</div>
        </div>
        <div style="margin-top: 12px;">
          <a href="/list" style="display: inline-block; padding: 6px 12px; background: #4299e1; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">
            View Details
          </a>
        </div>
      </div>
    `;
  }

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
      const popupContent = createPopupContent(resource);
      marker.bindPopup(popupContent);
      marker.addTo(markersLayer!);
    });

    // Fit bounds if we have markers
    if (validResources.length > 0) {
      const bounds = leaflet.latLngBounds(validResources.map((r) => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  function handleLocationRequest() {
    if (!map || !leaflet) return;

    // Check if geolocation is available
    if (!navigator.geolocation) {
      locationState = 'error';
      locationError = 'Geolocation is not supported by your browser';
      return;
    }

    locationState = 'loading';
    locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!map || !leaflet) return;

        const { latitude, longitude } = position.coords;

        // Remove existing user location marker if any
        if (userLocationMarker) {
          userLocationMarker.remove();
        }

        // Create a circle marker for user location
        userLocationMarker = leaflet.circleMarker([latitude, longitude], {
          color: '#4299e1',
          fillColor: '#4299e1',
          fillOpacity: 0.3,
          radius: 10,
          weight: 2
        });

        userLocationMarker.bindPopup('You are here');
        userLocationMarker.addTo(map);

        // Center map on user location
        map.setView([latitude, longitude], 15);

        locationState = 'success';
      },
      (error) => {
        locationState = 'error';
        locationError = 
          error.code === 1 ? 'Location permission denied' :
          error.code === 2 ? 'Location unavailable' :
          error.code === 3 ? 'Location request timed out' :
          'Failed to get your location';
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
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

<button
  class="location-button"
  onclick={handleLocationRequest}
  disabled={locationState === 'loading'}
  title="Center map on your location"
>
  {#if locationState === 'loading'}
    <span class="spinner"></span>
    <span>Locating...</span>
  {:else}
    <span class="icon">📍</span>
    <span>My Location</span>
  {/if}
</button>

{#if locationState === 'error' && locationError}
  <div class="location-error">
    {locationError}
    <button
      class="dismiss-button"
      onclick={() => {
        locationState = 'idle';
        locationError = '';
      }}
    >
      ×
    </button>
  </div>
{/if}

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

  .location-button {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s;
  }

  .location-button:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .location-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .location-button .icon {
    font-size: 16px;
    line-height: 1;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .location-error {
    position: absolute;
    bottom: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-danger);
    color: white;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    box-shadow: var(--shadow-sm);
    max-width: 90%;
  }

  .dismiss-button {
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dismiss-button:hover {
    opacity: 0.8;
  }
</style>
