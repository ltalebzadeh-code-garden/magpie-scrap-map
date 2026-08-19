<script lang="ts">
  import { isOnline } from '$lib/stores';
  import ResourceMap from '$lib/components/ResourceMap.svelte';
  import { Badge, Button, Card, Input } from '$lib/components/ui';
  import { ErrorState, LoadingState } from '$lib/components/states';
  import { categoryLabels, categoryList } from '$lib/utils';
  import { formatDateTime } from '$lib/utils/time';
  import {
    createNearbySearchController,
    nearbyRadiusOptions,
    nearbyStatusOptions,
    formatDistance
  } from '$lib/stores/nearby-search';

  let { data } = $props();
  let legendOpen = $state(true);

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
      locationError.set('عرض جغرافیایی باید بین ۹۰- و ۹۰ باشد.');
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      locationError.set('طول جغرافیایی باید بین ۱۸۰- و ۱۸۰ باشد.');
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
        <div class="offline-warning">⚠️ کاشی‌های نقشه ممکن است در حالت آفلاین بار نشوند</div>
      {/if}
      <ResourceMap resources={$resourcesForMap} />

      {#if legendOpen}
        <aside class="map-legend" aria-label="راهنمای نقشه">
          <div class="map-legend__header">
            <p class="map-legend__title">راهنمای نقشه</p>

            <button
              type="button"
              class="map-legend__close"
              aria-label="بستن راهنمای نقشه"
              title="بستن راهنما"
              onclick={() => (legendOpen = false)}
            >
              ×
            </button>
          </div>

          <p class="map-legend__description">
            این نقشه منابع قابل‌ واگذاری اطراف شما را نشان می‌دهد. برای دیدن جزئیات بیشتر، روی هر
            پین کلیک کنید.
          </p>
        </aside>
      {:else}
        <button
          type="button"
          class="map-legend__open"
          aria-label="نمایش راهنمای نقشه"
          onclick={() => (legendOpen = true)}
        >
          راهنمای نقشه
        </button>
      {/if}
      
    </div>

    <div class="nearby-panel">
      <Card padding="medium" class="controls-card">
        <div class="panel-header">
          <div>
            <h2>جست‌وجوی منابع نزدیک</h2>
            <p class="panel-subtitle">منابع نزدیک به موقعیت فعلی یا انتخابی خود را جست‌وجو کنید.</p>
          </div>
        </div>

        <div class="location-actions">
          <Button
            type="button"
            variant="ghost"
            on:click={requestLocation}
            disabled={$isLoadingNearby}
          >
            📍 از موقعیت من استفاده کن
          </Button>

          <form class="location-form" onsubmit={selectLocationFromInput}>
            <label>
              <span>عرض جغرافیایی</span>
              <Input name="latitude" type="number" step="0.000001" value={$searchLatitude ?? ''} />
            </label>
            <label>
              <span>طول جغرافیایی</span>
              <Input
                name="longitude"
                type="number"
                step="0.000001"
                value={$searchLongitude ?? ''}
              />
            </label>
            <Button type="submit" size="small">استفاده از مختصات</Button>
          </form>
        </div>

        {#if $locationError}
          <p class="location-error">{$locationError}</p>
        {/if}

        <div class="controls-grid">
          <label>
            <span>شعاع</span>
            <select bind:value={$selectedRadius}>
              {#each nearbyRadiusOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>دسته‌بندی</span>
            <select bind:value={$selectedCategory}>
              <option value="">همه دسته‌ها</option>
              {#each categoryList as category}
                <option value={category}>{categoryLabels[category]}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>وضعیت</span>
            <select bind:value={$selectedStatus}>
              <option value="">هر وضعیتی</option>
              {#each nearbyStatusOptions as option}
                <option value={option}>
                  {option === 'available'
                    ? 'موجود'
                    : option === 'claimed'
                      ? 'برداشته‌شده'
                      : option === 'possibly_gone'
                        ? 'احتمالاً ناپدید شده'
                        : 'منقضی'}
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
            {$isLoadingNearby ? 'در حال جست‌وجو…' : 'جست‌وجوی نزدیک'}
          </Button>
          {#if $nearbyResources}
            <Button type="button" variant="ghost" on:click={clearNearby}>
              پاک کردن جست‌وجوی نزدیک
            </Button>
          {/if}
        </div>

        {#if $isLoadingNearby}
          <LoadingState message="در حال جست‌وجوی منابع نزدیک…" />
        {:else if $nearbyError}
          {#if $isUsingCachedData}
            <div class="cache-notice">
              <p>⚠️ {$nearbyError}</p>
            </div>
          {:else}
            <ErrorState message={$nearbyError} onRetry={fetchNearby} />
          {/if}
        {:else if $showEmptyNearby}
          <p class="empty-message">
            منبعی در این شعاع پیدا نشد. شعاع بزرگ‌تر یا فیلترهای دیگر را امتحان کنید.
          </p>
        {/if}
      </Card>

      <Card padding="medium" class="list-card">
        <div class="list-header">
          <h3>{$nearbyResources ? 'منابع نزدیک' : 'منابع اخیر'}</h3>
          <Badge variant="info">{$primaryCount}</Badge>
        </div>

        {#if !$hasAttemptedNearby}
          <p class="list-hint">
            منابع اخیر نمایش داده می‌شوند. برای جست‌وجوی نزدیک، موقعیت را تعیین کنید.
          </p>
        {:else if $isUsingCachedData}
          <p class="cache-hint">📦 نمایش نتایج ذخیره‌شده (مربوط به حداکثر ۱۰ دقیقه قبل).</p>
        {/if}

        {#if $primaryCount === 0 && !$isLoadingNearby}
          <p class="empty-message">منبعی برای نمایش وجود ندارد.</p>
        {:else}
          <ul class="resource-list">
            {#each $listViewResources as resource}
              <li class="resource-item">
                <a class="resource-item__link" href={`/resource/${resource.id}`}>
                  {#if resource.photo_url}
                    <img
                      class="resource-item__thumb"
                      src={resource.photo_url}
                      alt=""
                      loading="lazy"
                      onerror={(event) => {
                        const img = event.currentTarget as HTMLImageElement | null;
                        if (img) img.hidden = true;
                      }}
                    />
                  {/if}
                  <div class="resource-item__header">
                    <strong>{resource.title}</strong>
                    <Badge status={resource.status} />
                  </div>
                  <div class="resource-item__meta">
                    <Badge category={resource.category} size="small" />
                    <span>{categoryLabels[resource.category as keyof typeof categoryLabels]}</span>
                    <span>•</span>
                    <span>{formatDateTime(resource.created_at)}</span>
                  </div>
                  <p class="resource-item__coords">
                    {resource.latitude.toFixed(5)}, {resource.longitude.toFixed(5)}
                  </p>
                  {#if formatDistance(resource.distance)}
                    <p class="resource-item__distance">{formatDistance(resource.distance)}</p>
                  {/if}
                </a>
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
    margin: calc(var(--space-3) * -1) calc(var(--space-3) * -1) calc(var(--space-3) * -1 - 5rem)
      calc(var(--space-3) * -1);
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
    overflow-y: auto;
    padding-bottom: 5rem;
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
    font-size: 0.8rem;
    margin-top: var(--space-2);
  }

  .location-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-2);
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
    margin-top: var(--space-2);
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
    margin-top: var(--space-2);
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
    background: white;
  }

  .resource-item__link {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .resource-item__link:hover,
  .resource-item__link:focus {
    background: var(--color-hover, #f7fafc);
    outline: 2px solid var(--color-primary, #2b6cb0);
    outline-offset: -2px;
  }

  .resource-item__thumb {
    width: 3rem;
    height: 3rem;
    flex: 0 0 3rem;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .resource-item__link :global(.resource-item__header),
  .resource-item__link :global(.resource-item__meta),
  .resource-item__link :global(.resource-item__coords),
  .resource-item__link :global(.resource-item__distance) {
    min-width: 0;
  }

  .resource-item__content {
    min-width: 0;
    flex: 1 1 auto;
  }

  .resource-item__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .resource-item__header strong {
    min-width: 0;
    flex: 1 1 auto;
    word-break: break-word;
  }

  .resource-item__meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-muted);
    font-size: 0.85rem;
    flex-wrap: wrap;
    min-width: 0;
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

  .map-legend {
    position: absolute;
    z-index: 900;
    right: auto;
    left: var(--space-4);
    bottom: var(--space-4);
    width: min(18rem, calc(100% - 2rem));
    padding: var(--space-3);
    direction: rtl;

    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(8px);
  }

  .map-legend__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .map-legend__title {
    margin: 0;
    color: var(--color-text);
    font-size: 0.9rem;
    font-weight: 700;
  }

  .map-legend__description {
    margin: var(--space-2) 0 0;
    color: var(--color-muted);
    font-size: 0.8rem;
    line-height: 1.7;
  }

  .map-legend__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;

    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--color-muted);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
  }

  .map-legend__close:hover,
  .map-legend__close:focus {
    background: var(--color-hover, #f1f5f9);
    color: var(--color-text);
    outline: none;
  }

  .map-legend__open {
    position: absolute;
    z-index: 900;
    right: auto;
    left: var(--space-4);
    bottom: var(--space-4);
    direction: rtl;

    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.95);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    font-size: 0.8rem;
  }

  .map-legend__open:hover,
  .map-legend__open:focus {
    background: var(--color-hover, #f7fafc);
    outline: 2px solid var(--color-primary, #2b6cb0);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .map-legend {
      left: var(--space-2);
      right: auto;
      bottom: calc(var(--space-4) + 1.5rem);
      width: min(17rem, calc(100% - 1rem));
    }

    .map-legend__open {
      left: var(--space-2);
      right: auto;
      bottom: var(--space-4);
    }
  }
</style>
