<script lang="ts">
  import { isOnline } from '$lib/stores';
</script>

<div class="page">
  <div class="placeholder">
    <h2>Offline Queue</h2>
    <div class="placeholder-content">
      <p>💾 View queued submissions and cached resources</p>
      <p>Pending uploads will sync when connection returns</p>
      {#if $isOnline}
        <p class="info-note">✓ Online - sync queue will process automatically</p>
      {:else}
        <p class="offline-note">⚠️ Offline - submissions are queued locally</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .page {
    padding: 1rem 0;
  }

  .placeholder {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  h2 {
    margin-top: 0;
    color: #2d3748;
  }

  .placeholder-content {
    color: #718096;
    line-height: 1.8;
  }

  .placeholder-content p {
    margin: 0.5rem 0;
  }

  .info-note {
    color: #48bb78;
    font-weight: 500;
    margin-top: 1rem;
  }

  .offline-note {
    color: #f56565;
    font-weight: 500;
    margin-top: 1rem;
  }
</style>
