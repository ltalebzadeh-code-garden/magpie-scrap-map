<script lang="ts">
  import { isOnline } from '$lib/stores';
  import ResourceMap from '$lib/components/ResourceMap.svelte';

  let { data } = $props();
</script>

<div class="page-container">
  <div class="map-wrapper">
    {#if !$isOnline}
      <div class="offline-warning">⚠️ Map tiles may not load while offline</div>
    {/if}
    <ResourceMap resources={data.resources} />
  </div>
</div>

<style>
  .page-container {
    /* Full height minus header and bottom nav, account for main padding */
    height: 100%;
    margin: calc(var(--space-3) * -1) calc(var(--space-3) * -1) calc(var(--space-3) * -1 - 5rem) calc(var(--space-3) * -1);
    border: 3px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
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

  @media (min-width: 769px) {
    .page-container {
      /* Desktop: no extra bottom margin needed */
      margin: calc(var(--space-6) * -1);
      border-width: 2px;
    }
  }
</style>
