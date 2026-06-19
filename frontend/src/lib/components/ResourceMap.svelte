<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type L from 'leaflet';

  interface Props {
    center?: [number, number];
    zoom?: number;
  }

  let { center = [51.505, -0.09], zoom = 13 }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;

  onMount(async () => {
    // Dynamic import to avoid SSR issues
    const leaflet = await import('leaflet');
    
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
  });

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
