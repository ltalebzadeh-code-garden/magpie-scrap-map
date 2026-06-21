<script lang="ts">
  import { isOnline } from '$lib/stores';
  import ResourceMap from '$lib/components/ResourceMap.svelte';
  import { Badge, Button, Card, Input } from '$lib/components/ui';
  import { ErrorState, LoadingState } from '$lib/components/states';
  import { categoryLabels, categoryList, getLocation, getLocationErrorMessage } from '$lib/utils';
  import type { NearbyResource, ResourceCategory, ResourceStatus } from '$lib/types';

  type RadiusOption = {
    label: string;
    value: number;
  };

  const radiusOptions: RadiusOption[] = [
    { label: '1 km', value: 1000 },
    { label: '5 km', value: 5000 },
    { label: '20 km', value: 20000 }
  ];

  const statusOptions: ResourceStatus[] = ['available', 'claimed', 'possibly_gone', 'expired'];

  let { data } = $props();

  let nearbyResources = $state<NearbyResource[] | null>(null);
  let isLoadingNearby = $state(false);
  let nearbyError = $state<string | null>(null);
  let hasAttemptedNearby = $state(false);

  let selectedRadius = $state(radiusOptions[1]?.value ?? 5000);
  let selectedCategory = $state<ResourceCategory | ''>('');
  let selectedStatus = $state<ResourceStatus | ''>('');

  let searchLatitude = $state<number | null>(null);
  let searchLongitude = $state<number | null>(null);
  let locationError = $state<string | null>(null);

  async function requestLocation() {
    locationError = null;
    try {
      const location = await getLocation({ enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
      searchLatitude = location.latitude;
      searchLongitude = location.longitude;
      await fetchNearby();
    } catch (error) {
      locationError = getLocationErrorMessage(error as GeolocationPositionError | Error);
    }
  }

  async function fetchNearby() {
    if (searchLatitude == null || searchLongitude == null) {
      locationError = 'Select a location before searching nearby resources.';
      return;
    }

    isLoadingNearby = true;
    nearbyError = null;
    hasAttemptedNearby = true;

    const payload = {
      latitude: searchLatitude,
      longitude: searchLongitude,
      radius_meters: Number(selectedRadius),
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      limit: 100
    } as const;

    const response = await fetch('/api/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({ error: { message: 'Nearby search failed.' } }));
      nearbyResources = null;
      nearbyError = errorPayload?.error?.message ?? 'Nearby search failed.';
      isLoadingNearby = false;
      return;
    }

    const json = (await response.json()) as { data: NearbyResource[] };

    isLoadingNearby = false;

    nearbyResources = json.data;
  }

  const resourcesForMap = $derived(nearbyResources ?? data.resources);

  const hasNearbyResults = $derived(Array.isArray(nearbyResources) && nearbyResources.length > 0);
  const showEmptyNearby = $derived(hasAttemptedNearby && !isLoadingNearby && !nearbyError && !hasNearbyResults);

  const primaryResources = $derived(nearbyResources ?? data.resources);

  const listViewResources = $derived(
    primaryResources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      category: resource.category,
      status: resource.status,
      latitude: resource.latitude,
      longitude: resource.longitude,
      created_at: resource.created_at,
      distance: 'distance_meters' in resource ? resource.distance_meters : undefined
    }))
  );

  const badgeLabel = $derived(
    nearbyResources ? `${nearbyResources.length} nearby` : `${data.resources.length} recent`
  );

  function selectLocationFromInput(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const lat = Number(formData.get('latitude'));
    const lon = Number(formData.get('longitude'));

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      locationError = 'Latitude must be between -90 and 90.';
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      locationError = 'Longitude must be between -180 and 180.';
      return;
    }

    searchLatitude = lat;
    searchLongitude = lon;
    locationError = null;
    fetchNearby();
  }

  function formatDistance(meters?: number) {
    if (!Number.isFinite(meters)) return null;

    const distance = meters as number;

    if (distance < 1000) {
      return `${Math.round(distance)} m away`;
    }
    return `${(distance / 1000).toFixed(1)} km away`;
  }
</script>

<div class="page-container">
  <div class="page-content">
    <div class="map-column">
      {#if !$isOnline}
        <div class="offline-warning">⚠️ Map tiles may not load while offline</div>
      {/if}
      <ResourceMap resources={resourcesForMap} />
    </div>

    <div class="nearby-panel">
      <Card padding="medium" class="controls-card">
        <div class="panel-header">
          <div>
            <h2>Nearby search</h2>
            <p class="panel-subtitle">Search resources near your current or chosen location.</p>
          </div>
          <Badge variant="info">{badgeLabel}</Badge>
        </div>

        <div class="location-actions">
          <Button type="button" variant="ghost" on:click={requestLocation} disabled={isLoadingNearby}>
            📍 Use my location
          </Button>

          <form class="location-form" onsubmit={selectLocationFromInput}>
            <label>
              <span>Latitude</span>
              <Input name="latitude" type="number" step="0.000001" value={searchLatitude ?? ''} />
            </label>
            <label>
              <span>Longitude</span>
              <Input name="longitude" type="number" step="0.000001" value={searchLongitude ?? ''} />
            </label>
            <Button type="submit" size="small">Use coordinates</Button>
          </form>
        </div>

        {#if locationError}
          <p class="location-error">{locationError}</p>
        {/if}

        <div class="controls-grid">
          <label>
            <span>Radius</span>
            <select bind:value={selectedRadius}>
              {#each radiusOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Category</span>
            <select bind:value={selectedCategory}>
              <option value="">All categories</option>
              {#each categoryList as category}
                <option value={category}>{categoryLabels[category]}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select bind:value={selectedStatus}>
              <option value="">Any status</option>
              {#each statusOptions as option}
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
            disabled={isLoadingNearby || searchLatitude == null || searchLongitude == null}
          >
            {isLoadingNearby ? 'Searching…' : 'Search nearby'}
          </Button>
          {#if nearbyResources}
            <Button
              type="button"
              variant="ghost"
              on:click={() => {
                nearbyResources = null;
                hasAttemptedNearby = false;
                nearbyError = null;
              }}
            >
              Clear nearby
            </Button>
          {/if}
        </div>

        {#if isLoadingNearby}
          <LoadingState message="Searching nearby resources…" />
        {:else if nearbyError}
          <ErrorState message={nearbyError} onRetry={fetchNearby} />
        {:else if showEmptyNearby}
          <p class="empty-message">No resources found within this radius. Try a larger radius or different filters.</p>
        {/if}
      </Card>

      <Card padding="medium" class="list-card">
        <div class="list-header">
          <h3>{nearbyResources ? 'Nearby resources' : 'Recent resources'}</h3>
          <Badge variant="info">{primaryResources.length}</Badge>
        </div>

        {#if !hasAttemptedNearby}
          <p class="list-hint">Showing recent resources. Set a location to search nearby instead.</p>
        {/if}

        {#if primaryResources.length === 0 && !isLoadingNearby}
          <p class="empty-message">No resources to display.</p>
        {:else}
          <ul class="resource-list">
            {#each listViewResources as resource}
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