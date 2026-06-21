<script lang="ts">
  import { Badge, Button, Card, Input } from '$lib/components/ui';
  import { ErrorState, LoadingState } from '$lib/components/states';
  import { categoryLabels, categoryList } from '$lib/utils';
import {
  createNearbySearchController,
  nearbyRadiusOptions,
  nearbyStatusOptions,
  nearbySortOptions,
  formatDistance
} from '$lib/stores/nearby-search';
  import type { NearbyResource } from '$lib/types';

  type ListPageData = {
    initialResources: NearbyResource[];
    fetchError: string | null;
  };

  let { data } = $props<{ data: ListPageData }>();

  const {
    stores: {
      selectedRadius,
      selectedCategory,
      selectedStatus,
      selectedSort,
      searchLatitude,
      searchLongitude,
      locationError,
      nearbyResources,
      listItems,
      isLoadingNearby,
      nearbyError,
      hasAttemptedNearby,
      showEmptyNearby,
      primaryCount,
      resultsBadgeLabel
    },
    actions: { requestLocation, fetchNearby, clearNearby, setCoordinates }
  } = createNearbySearchController(data.initialResources);

  const listViewResources = listItems;
  const badgeLabel = resultsBadgeLabel;

  function handleCoordinateSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const lat = Number(formData.get('latitude'));
    const lon = Number(formData.get('longitude'));

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      locationError.set('Latitude must be between -90 and 90.');
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      locationError.set('Longitude must be between -180 and 180.');
      return;
    }

    setCoordinates(lat, lon);
    locationError.set(null);
    fetchNearby();
  }
</script>

<div class="list-page">
  <div class="page-header">
    <div>
      <h1>Nearby list</h1>
      <p class="subtitle">Browse nearby resources without relying on map tiles.</p>
    </div>
    <Badge variant="info">{$badgeLabel}</Badge>
  </div>

  {#if data.fetchError}
    <Card padding="medium" class="error-card">
      <ErrorState message={data.fetchError} />
    </Card>
  {/if}

  <Card padding="medium" class="controls-card">
    <div class="controls-header">
      <div>
        <h2>Set your search area</h2>
        <p class="caption">Use your location or enter coordinates, radius, and optional filters.</p>
      </div>
      {#if $nearbyResources}
        <Button type="button" variant="ghost" size="small" on:click={clearNearby}>Clear nearby</Button>
      {/if}
    </div>

    <div class="location-actions">
      <Button type="button" on:click={requestLocation} disabled={$isLoadingNearby}>
        {#if $isLoadingNearby}
          Searching…
        {:else}
          📍 Use my location
        {/if}
      </Button>

      <form class="location-form" onsubmit={handleCoordinateSubmit}>
        <label>
          <span>Latitude</span>
          <Input name="latitude" type="number" step="0.000001" value={$searchLatitude ?? ''} />
        </label>
        <label>
          <span>Longitude</span>
          <Input name="longitude" type="number" step="0.000001" value={$searchLongitude ?? ''} />
        </label>
        <Button type="submit" size="small">Use coordinates</Button>
      </form>
    </div>

    {#if $locationError}
      <p class="location-error">{$locationError}</p>
    {/if}

    <div class="filters-grid">
      <label>
        <span>Radius</span>
        <select bind:value={$selectedRadius}>
          {#each nearbyRadiusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>Category</span>
        <select bind:value={$selectedCategory}>
          <option value="">All categories</option>
          {#each categoryList as category}
            <option value={category}>{categoryLabels[category]}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>Status</span>
        <select bind:value={$selectedStatus}>
          <option value="">Any status</option>
          {#each nearbyStatusOptions as option}
            <option value={option}>
              {option === 'possibly_gone'
                ? 'Possibly Gone'
                : option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          {/each}
        </select>
      </label>

      <label>
        <span>Sort by</span>
        <select bind:value={$selectedSort}>
          {#each nearbySortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="actions-row">
      <Button
        type="button"
        on:click={fetchNearby}
        disabled={$isLoadingNearby || $searchLatitude == null || $searchLongitude == null}
      >
        {$isLoadingNearby ? 'Searching…' : 'Search nearby'}
      </Button>
    </div>

    {#if $isLoadingNearby}
      <LoadingState message="Searching nearby resources…" />
    {:else if $nearbyError}
      <ErrorState message={$nearbyError} onRetry={fetchNearby} />
    {:else if $showEmptyNearby}
      <p class="empty-state">No resources found within this radius.</p>
    {/if}
  </Card>

  <Card padding="medium" class="list-card">
    <div class="list-header">
      <h2>Results</h2>
      <Badge variant="info">{$primaryCount}</Badge>
    </div>

    {#if !$hasAttemptedNearby}
      <p class="list-hint">Showing recent resources. Pick a location and radius to search nearby.</p>
    {/if}

    {#if $isLoadingNearby}
      <LoadingState message="Loading nearby resources…" />
    {:else if $nearbyError}
      <ErrorState message={$nearbyError} onRetry={fetchNearby} />
    {:else if $showEmptyNearby}
      <p class="empty-state">No nearby resources match these filters.</p>
    {:else if $primaryCount === 0}
      <p class="empty-state">No resources available yet.</p>
    {:else}
      <ul class="resource-list">
        {#each $listViewResources as resource}
          <li class="resource-item">
            <div class="item-header">
              <div>
                <strong>{resource.title}</strong>
                <p class="item-meta">
                  <Badge category={resource.category} size="small" />
                  <span>{categoryLabels[resource.category as keyof typeof categoryLabels]}</span>
                </p>
              </div>
              <Badge status={resource.status} />
            </div>

            <div class="item-details">
              <span>{new Date(resource.created_at).toLocaleString()}</span>
              <span>•</span>
              <span>{resource.latitude.toFixed(5)}, {resource.longitude.toFixed(5)}</span>
            </div>

            {#if formatDistance(resource.distance)}
              <p class="item-distance">{formatDistance(resource.distance)}</p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </Card>
</div>

<style>
  .list-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .subtitle {
    margin: 0;
    color: var(--color-muted);
  }

  .controls-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .controls-header {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: center;
  }

  .caption {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  .location-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .location-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-2);
    align-items: end;
  }

  .location-form label {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .location-error {
    margin: 0;
    color: var(--color-danger);
    font-size: 0.875rem;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-2);
  }

  .filters-grid label {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .filters-grid select {
    min-height: 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.6rem;
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .empty-state {
    margin: 0;
    color: var(--color-muted);
  }

  .list-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .list-hint {
    margin: 0;
    color: var(--color-muted);
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
    background: var(--color-surface);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .item-meta {
    margin: var(--space-1) 0 0;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.85rem;
    color: var(--color-muted);
  }

  .item-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-size: 0.85rem;
    color: var(--color-muted);
  }

  .item-distance {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-primary);
  }

  @media (min-width: 960px) {
    .list-page {
      gap: var(--space-4);
    }

    .resource-item {
      flex-direction: column;
    }
  }
</style>