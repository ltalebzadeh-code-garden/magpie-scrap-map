<script lang="ts">
  import { isOnline } from '$lib/stores';
  import ResourceMap from '$lib/components/ResourceMap.svelte';
  import { Badge, Button, Card, Input } from '$lib/components/ui';
  import { ErrorState, LoadingState } from '$lib/components/states';
  import { categoryLabels, categoryList } from '$lib/utils';
  import {
    createNearbySearchController,
    nearbyRadiusOptions,
    nearbyStatusOptions,
    formatDistance
  } from '$lib/stores/nearby-search';

  let { data } = $props();

  const {
    stores: {
      selectedRadius,
      selectedCategory,
      selectedStatus,
      searchLatitude,
      searchLongitude,
      locationError,
      nearbyResources,
      primaryResources,
      listItems,
      isLoadingNearby,
      nearbyError,
      hasAttemptedNearby,
      showEmptyNearby,
      resultsBadgeLabel,
      primaryCount,
      isUsingCachedData
    },
    actions: { requestLocation, fetchNearby, clearNearby, setCoordinates }
  } = createNearbySearchController(data.resources);

  const listViewResources = listItems;
  const resourcesForMap = primaryResources;
  const badgeLabel = resultsBadgeLabel;

  function selectLocationFromInput(event: SubmitEvent) {
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

<div class="page-container">
  <div class="page-content">
    <div class="map-column">
      {#if !$isOnline}
        <div class="offline-warning">⚠️ Map tiles may not load while offline</div>
      {/if}
      <ResourceMap resources={$resourcesForMap} />
    </div>

    <div class="nearby-panel">
      <Card padding="medium" class="controls-card">
        <div class="panel-header">
          <div>
            <h2>Nearby search</h2>
            <p class="panel-subtitle">Search resources near your current or chosen location.</p>
          </div>
          <Badge variant="info">{$badgeLabel}</Badge>
        </div>

        <div class="location-actions">
          <Button type="button" variant="ghost" on:click={requestLocation} disabled={$isLoadingNearby}>
            📍 Use my location
          </Button>

          <form class="location-form" onsubmit={selectLocationFromInput}>
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

        <div class="controls-grid">
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
        </div>

        <div class="actions-row">
          <Button
            type="button"
            on:click={fetchNearby}
            disabled={$isLoadingNearby || $searchLatitude == null || $searchLongitude == null}
          >
            {$isLoadingNearby ? 'Searching…' : 'Search nearby'}
          </Button>
          {#if $nearbyResources}
            <Button
              type="button"
              variant="ghost"
              on:click={clearNearby}
            >
              Clear nearby
            </Button>
          {/if}
        </div>

        {#if $isLoadingNearby}
          <LoadingState message="Searching nearby resources…" />
        {:else if $nearbyError}
          {#if $isUsingCachedData}
            <div class="cache-notice">
              <p>⚠️ {$nearbyError}</p>
            </div>
          {:else}
            <ErrorState message={$nearbyError} onRetry={fetchNearby} />
          {/if}
        {:else if $showEmptyNearby}
          <p class="empty-message">No resources found within this radius. Try a larger radius or different filters.</p>
        {/if}
      </Card>

      <Card padding="medium" class="list-card">
        <div class="list-header">
          <h3>{$nearbyResources ? 'Nearby resources' : 'Recent resources'}</h3>
          <Badge variant="info">{$primaryCount}</Badge>
        </div>

        {#if !$hasAttemptedNearby}
          <p class="list-hint">Showing recent resources. Set a location to search nearby instead.</p>
        {:else if $isUsingCachedData}
          <p class="cache-hint">📦 Showing cached results (up to 10 minutes old).</p>
        {/if}

        {#if $primaryCount === 0 && !$isLoadingNearby}
          <p class="empty-message">No resources to display.</p>
        {:else}
          <ul class="resource-list">
            {#each $listViewResources as resource}
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
                {#if formatDistance(resource.distance)}
                  <p class="resource-item__distance">{formatDistance(resource.distance)}</p>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </Card>
    </div>
  </div>
</div>

<style>
  .page-container {
    height: 100%;
    margin: calc(var(--space-3) * -1) calc(var(--space-3) * -1) calc(var(--space-3) * -1 - 5rem) calc(var(--space-3) * -1);
    border: 3px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .page-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .map-column {
    position: relative;
    flex: 1 1 auto;
    min-height: 420px;
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

  .nearby-panel {
    position: static;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .controls-card,
  .list-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.125rem;
  }

  .panel-subtitle {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .location-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .location-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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

  .controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-2);
  }

  .controls-grid label {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .controls-grid select {
    min-height: 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.6rem;
    background: var(--color-surface);
    color: var(--color-text);
  }

  .actions-row {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .list-hint {
    margin: var(--space-2) 0;
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  .resource-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .resource-item {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    background: white;
  }

  .resource-item__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .resource-item__meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-muted);
    font-size: 0.85rem;
    flex-wrap: wrap;
  }

  .resource-item__coords {
    margin: 0;
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--color-muted);
  }

  .resource-item__distance {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-primary);
  }

  .empty-message {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  .cache-hint {
    margin: 0;
    color: var(--color-primary);
    font-size: 0.875rem;
  }

  .cache-notice {
    padding: var(--space-2);
    background: var(--color-warning-bg, #fef3c7);
    border: 1px solid var(--color-warning, #f59e0b);
    border-radius: var(--radius-md);
  }

  .cache-notice p {
    margin: 0;
    color: var(--color-warning-text, #78350f);
    font-size: 0.875rem;
  }

  @media (min-width: 960px) {
    .page-content {
      flex-direction: row;
      gap: var(--space-4);
    }

    .page-content {
      padding: var(--space-6);
    }

    .map-column {
      min-height: 600px;
      flex: 2 1 0;
    }

    .nearby-panel {
      flex: 0 0 360px;
      max-width: 420px;
      gap: var(--space-4);
      align-self: flex-start;
    }

    .page-container {
      margin: calc(var(--space-6) * -1);
      border-width: 2px;
    }
  }
</style>
