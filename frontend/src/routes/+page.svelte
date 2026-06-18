<script lang="ts">
  import { isOnline } from '$lib/stores';
</script>

<div class="page-container">
  <div class="surface-card surface-card--center placeholder-card">
    <h2>Map View</h2>
    <div class="placeholder-content section-stack">
      <p>📍 Interactive map will be displayed here</p>
      <p>Shows nearby resources with markers and popups</p>
      {#if !$isOnline}
        <p class="state-note state-note--danger">⚠️ Map tiles may not load while offline</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .placeholder-card {
    padding: var(--space-8);
  }

  h2 {
    margin-top: 0;
    margin-bottom: var(--space-3);
    color: var(--color-text);
  }

  .placeholder-content {
    color: var(--color-muted);
    line-height: var(--line-copy);
  }

  .placeholder-content p {
    margin: 0;
  }
</style>
