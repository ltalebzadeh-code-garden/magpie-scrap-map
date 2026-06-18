<script lang="ts">
  import { isOnline } from '$lib/stores';
  import { Card, Button } from '$lib/components/ui';
  import { LoadingState, ErrorState } from '$lib/components/states';

  let showLoading = $state(true);
  let showError = $state(true);

  function handleRetry() {
    showError = false;
  }
</script>

<div class="page">
  <div class="placeholder">
    <h2>List View</h2>
    <div class="placeholder-content">
      <p>📋 Text-first list of nearby resources</p>
      <p>Filters: radius, category, status</p>
      <p>Sort by: distance or newest</p>
      {#if !$isOnline}
        <p class="info-note">✓ Cached results available offline</p>
      {/if}
    </div>
  </div>

  <div class="example-card">
    <Card padding="medium">
      <div class="example-header">
        <h3>State Components Example</h3>
        <Button type="button" variant="ghost" size="small" on:click={() => (showLoading = !showLoading)}>
          Toggle Loading
        </Button>
      </div>

      {#if showLoading}
        <LoadingState message="Loading nearby resources…" />
      {/if}

      {#if showError}
        <ErrorState message="Could not load list data. Please try again." onRetry={handleRetry} />
      {:else}
        <p class="retry-success">✓ Retry clicked (error cleared in demo state).</p>
        <Button type="button" variant="ghost" size="small" on:click={() => (showError = true)}>
          Show Error Again
        </Button>
      {/if}
    </Card>
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

  .example-card {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .example-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #2d3748;
  }

  .retry-success {
    margin: 0;
    color: #2f855a;
    font-size: 0.9rem;
  }
</style>
