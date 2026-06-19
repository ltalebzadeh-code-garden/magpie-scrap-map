<script lang="ts">
  import { isOnline } from '$lib/stores';
  import ResourceMap from '$lib/components/ResourceMap.svelte';
</script>

<div class="page-container">
  <div class="map-wrapper">
    {#if !$isOnline}
      <div class="offline-warning">⚠️ Map tiles may not load while offline</div>
    {/if}
    <ResourceMap center={[51.505, -0.09]} zoom={13} />
  </div>
</div>

<style>
  .page-container {
    height: calc(100vh - 120px);
    padding: 0;
  }

  .map-wrapper {
    height: 100%;
    width: 100%;
    position: relative;
  }

  .offline-warning {
    position: absolute;
    top: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: var(--color-danger);
    color: white;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    box-shadow: var(--shadow-sm);
  }
</style>
