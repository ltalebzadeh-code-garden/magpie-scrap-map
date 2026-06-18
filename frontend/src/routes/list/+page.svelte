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

<div class="page-container">
  <div class="surface-card surface-card--center placeholder-card">
    <h2>List View</h2>
    <div class="placeholder-content section-stack">
      <p>📋 Text-first list of nearby resources</p>
      <p>Filters: radius, category, status</p>
      <p>Sort by: distance or newest</p>
      {#if !$isOnline}
        <p class="state-note state-note--success">✓ Cached results available offline</p>
      {/if}
    </div>
  </div>

  <div class="section-stack example-card">
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

  .example-card {
    margin-top: var(--space-2);
  }

  .example-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text);
  }

  .retry-success {
    margin: 0;
    color: var(--color-success);
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    .example-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
