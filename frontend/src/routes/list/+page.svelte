<script lang="ts">
  import { Badge, Button, Card, Input } from '$lib/components/ui';
  import { ErrorState, LoadingState } from '$lib/components/states';
  import { categoryLabels, categoryList, formatRelativeTime } from '$lib/utils';
  import { formatDateTime } from '$lib/utils/time';
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
      resultsBadgeLabel,
      isUsingCachedData
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

<div class="list-page">
  <div class="page-header">
    <div>
      <h1>فهرست منابع نزدیک</h1>
      <p class="subtitle">منابع نزدیک را بدون نیاز به نقشه مرور کنید.</p>
    </div>
  </div>

  {#if data.fetchError}
    <Card padding="medium" class="error-card">
      <ErrorState message={data.fetchError} />
    </Card>
  {/if}

  <Card padding="medium" class="controls-card">
    <div class="controls-header">
      <div>
            <h2>ناحیه جست‌وجو را تعیین کنید</h2>
        <p class="caption">از موقعیت خود استفاده کنید یا مختصات، شعاع و فیلترهای اختیاری را وارد کنید.</p>
      </div>
      {#if $nearbyResources}
        <Button type="button" variant="ghost" size="small" on:click={clearNearby}>پاک کردن جست‌وجوی نزدیک</Button>
      {/if}
    </div>

    <div class="location-actions">
      <Button type="button" on:click={requestLocation} disabled={$isLoadingNearby}>
        {#if $isLoadingNearby}
          در حال جست‌وجو…
        {:else}
          📍 از موقعیت من استفاده کن
        {/if}
      </Button>

      <form class="location-form" onsubmit={handleCoordinateSubmit}>
        <label>
          <span>عرض جغرافیایی</span>
          <Input name="latitude" type="number" step="0.000001" value={$searchLatitude ?? ''} />
        </label>
        <label>
          <span>طول جغرافیایی</span>
          <Input name="longitude" type="number" step="0.000001" value={$searchLongitude ?? ''} />
        </label>
        <Button type="submit" size="small">استفاده از مختصات</Button>
      </form>
    </div>

    {#if $locationError}
      <p class="location-error">{$locationError}</p>
    {/if}

    <div class="filters-grid">
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

      <label>
        <span>مرتب‌سازی بر اساس</span>
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
        {$isLoadingNearby ? 'در حال جست‌وجو…' : 'جست‌وجوی نزدیک'}
      </Button>
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
      <p class="empty-state">منبعی در این شعاع پیدا نشد.</p>
    {/if}
  </Card>

  <Card padding="medium" class="list-card">
    <div class="list-header">
      <h2>نتایج</h2>
      <Badge variant="info">{$primaryCount}</Badge>
    </div>

    {#if !$hasAttemptedNearby}
      <p class="list-hint">منابع اخیر نمایش داده می‌شوند. موقعیت و شعاع را برای جست‌وجوی نزدیک انتخاب کنید.</p>
    {:else if $isUsingCachedData}
      <p class="cache-hint">📦 نمایش نتایج ذخیره‌شده (مربوط به حداکثر ۱۰ دقیقه قبل).</p>
    {/if}

    {#if $isLoadingNearby}
      <LoadingState message="در حال بارگذاری منابع نزدیک…" />
    {:else if $nearbyError}
      <ErrorState message={$nearbyError} onRetry={fetchNearby} />
    {:else if $showEmptyNearby}
      <p class="empty-state">هیچ منبع نزدیکی با این فیلترها مطابقت ندارد.</p>
    {:else if $primaryCount === 0}
      <p class="empty-state">هنوز منبعی موجود نیست.</p>
    {:else}
      <ul class="resource-list">
        {#each $listViewResources as resource}
          <li class="resource-item">
            <a class="resource-item-link" href={`/resource/${resource.id}`}>
              {#if resource.photo_url}
                <img
                  class="resource-item-thumb"
                  src={resource.photo_url}
                  alt=""
                  loading="lazy"
                  onerror={(event) => {
                    const img = event.currentTarget as HTMLImageElement | null;
                    if (img) img.hidden = true;
                  }}
                />
              {/if}
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
                    <span>{formatDateTime(resource.created_at)}</span>
                <span>•</span>
                <span>{resource.latitude.toFixed(5)}, {resource.longitude.toFixed(5)}</span>
              </div>

              {#if formatDistance(resource.distance)}
                <p class="item-distance">{formatDistance(resource.distance)}</p>
              {/if}
            </a>
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
    padding-bottom: 5rem;
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
    color: var(--color-muted);
    font-size: 0.9rem;
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
    margin-top: var(--space-2);
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
    margin-top: var(--space-2);
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
    background: var(--color-surface);
  }

  .resource-item-link {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .resource-item-thumb {
    width: 3rem;
    height: 3rem;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .resource-item-link:hover,
  .resource-item-link:focus {
    background: var(--color-hover, #f7fafc);
    outline: 2px solid var(--color-primary, #2b6cb0);
    outline-offset: -2px;
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

  .item-age {
    font-weight: 500;
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
