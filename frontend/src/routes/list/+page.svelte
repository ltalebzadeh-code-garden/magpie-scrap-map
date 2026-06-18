<script lang="ts">
  import { isOnline } from '$lib/stores';
  import { Card, Button, Badge } from '$lib/components/ui';
  import { LoadingState, ErrorState } from '$lib/components/states';
  import { categoryLabels } from '$lib/utils';
  import type { ResourceSummary, ResourceStatus } from '$lib/types';

  type ListPageData = {
    resources: ResourceSummary[];
    error: string | null;
  };

  type ListPageForm = {
    success?: boolean;
    message?: string;
    fieldErrors?: Record<string, string>;
    values?: {
      id?: string;
      status?: string;
    };
  };

  let { data, form } = $props<{ data: ListPageData; form?: ListPageForm }>();

  let showLoading = $state(true);
  let showError = $state(true);

  function handleRetry() {
    showError = false;
  }

  const resources = $derived(data.resources ?? []);
  const loadError = $derived(data.error);
  const formError = $derived(form?.success === false ? form?.message ?? null : null);
  const formSuccess = $derived(form?.success === true ? form?.message ?? null : null);

  const statusOptions: ResourceStatus[] = ['available', 'claimed', 'possibly_gone', 'expired'];

  function labelForStatus(status: ResourceStatus): string {
    if (status === 'possibly_gone') {
      return 'Possibly Gone';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  }
</script>

<div class="page-container">
  <div class="surface-card surface-card--center placeholder-card">
    <h2>List View</h2>
    <div class="placeholder-content section-stack">
      <p>📋 Text-first list of recent resources (newest first)</p>
      <p>Current source: Supabase recent resource fetch</p>
      {#if !$isOnline}
        <p class="state-note state-note--success">✓ Offline mode enabled (showing last server-rendered list)</p>
      {/if}
    </div>
  </div>

  <Card padding="medium" class="example-card">
    <div class="example-header">
      <h3>Recent Resources</h3>
      <Badge variant="info">{resources.length} items</Badge>
    </div>

    {#if formSuccess}
      <p class="submit-success">{formSuccess}</p>
    {/if}

    {#if formError}
      <p class="submit-error">{formError}</p>
    {/if}

    {#if loadError}
      <ErrorState message={loadError} />
    {:else if resources.length === 0}
      <p class="retry-success">No resources found yet. Add one from the Add page.</p>
    {:else}
      <ul class="resource-list">
        {#each resources as resource}
          <li class="resource-item">
            <div class="resource-item__header">
              <strong>{resource.title}</strong>
              <Badge status={resource.status} />
            </div>
            <div class="resource-item__meta">
              <Badge category={resource.category} size="small" />
              <span>{categoryLabels[resource.category as keyof typeof categoryLabels]}</span>
              <span>•</span>
              <span>{new Date(resource.created_at).toLocaleString()}</span>
            </div>
            <p class="resource-item__coords">{resource.latitude.toFixed(5)}, {resource.longitude.toFixed(5)}</p>

            <form method="POST" action="?/updateStatus" class="status-form">
              <input type="hidden" name="id" value={resource.id} />
              <label>
                <span class="status-label">Status</span>
                <select name="status" class="status-select" value={resource.status}>
                  {#each statusOptions as option}
                    <option value={option}>{labelForStatus(option)}</option>
                  {/each}
                </select>
              </label>
              <Button type="submit" size="small" variant="ghost">Update</Button>
            </form>
          </li>
        {/each}
      </ul>
    {/if}
  </Card>

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

  .resource-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .resource-item {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background: var(--color-surface);
  }

  .resource-item__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  .resource-item__meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-muted);
    font-size: 0.875rem;
    flex-wrap: wrap;
  }

  .resource-item__coords {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.8125rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }

  .submit-success {
    margin: 0;
    color: var(--color-success);
    font-size: 0.9rem;
  }

  .submit-error {
    margin: 0;
    color: var(--color-error);
    font-size: 0.9rem;
  }

  .status-form {
    display: flex;
    align-items: end;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .status-label {
    display: block;
    font-size: 0.8125rem;
    color: var(--color-muted);
    margin-bottom: var(--space-1);
  }

  .status-select {
    min-height: 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.6rem;
    background: var(--color-surface);
    color: var(--color-text);
  }

  @media (max-width: 480px) {
    .example-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
