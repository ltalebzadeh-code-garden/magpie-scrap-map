<script lang="ts">
  import { Badge, Card, Button } from '$lib/components/ui';
  import { categoryLabels, formatRelativeTime } from '$lib/utils';
  import type { Resource } from '$lib/types';

  type ResourceDetailData = {
    resource: Resource;
  };

  let { data } = $props<{ data: ResourceDetailData }>();

  const resource = data.resource;
  const mapsHref = `https://www.google.com/maps?q=${resource.latitude},${resource.longitude}`;

  let copyFeedback = $state('');

  function copyLink() {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      copyFeedback = 'Copy not supported';
      return;
    }

    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        copyFeedback = 'Link copied!';
        setTimeout(() => {
          copyFeedback = '';
        }, 2000);
      })
      .catch(() => {
        copyFeedback = 'Copy failed';
        setTimeout(() => {
          copyFeedback = '';
        }, 2000);
      });
  }

  const isStale = resource.status === 'expired' || (resource.expires_at && new Date(resource.expires_at) < new Date());
</script>

<div class="detail-page">
  <Card padding="large" class="detail-card">
    {#if isStale}
      <div class="stale-warning">
        ⚠️ This resource may no longer be available.
      </div>
    {/if}

    <div class="header-row">
      <div>
        <h1>{resource.title}</h1>
        <p class="meta-line">Posted {formatRelativeTime(resource.created_at)}</p>
      </div>
      <div class="badges">
        <Badge category={resource.category} />
        <Badge status={resource.status} />
      </div>
    </div>

    {#if resource.photo_url}
      <div class="photo-wrap">
        <img src={resource.photo_url} alt={`Photo for ${resource.title}`} loading="lazy" />
      </div>
    {/if}

    <section class="section">
      <h2>Description</h2>
      <p>{resource.description}</p>
    </section>

    <section class="section">
      <h2>Location</h2>
      <p class="mono">{resource.latitude.toFixed(6)}, {resource.longitude.toFixed(6)}</p>
      <p class="subtle">
        Accuracy: {resource.location_accuracy === 'area_only'
          ? 'Approximate area'
          : resource.location_accuracy === 'approximate'
            ? 'Approximate point'
            : 'Exact point'}
      </p>
      <a class="maps-link" href={mapsHref} target="_blank" rel="noopener noreferrer">Open in maps</a>
    </section>

    <section class="section">
      <h2>Details</h2>
      <p><strong>Category:</strong> {categoryLabels[resource.category as keyof typeof categoryLabels]}</p>
      {#if resource.contact_method}
        <p><strong>Contact:</strong> {resource.contact_method}</p>
      {/if}
    </section>

    <div class="actions">
      <Button type="button" variant="ghost" on:click={() => history.back()}>Back</Button>
      <Button type="button" on:click={copyLink}>
        {copyFeedback || 'Copy link'}
      </Button>
    </div>
  </Card>
</div>

<style>
  .detail-page {
    max-width: 52rem;
    margin: 0 auto;
    padding: 1rem;
  }

  .detail-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
  }

  .meta-line {
    margin: 0.35rem 0 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .badges {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .photo-wrap img {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .section h2 {
    margin: 0 0 0.5rem;
    font-size: 1.05rem;
  }

  .section p {
    margin: 0.25rem 0;
    line-height: 1.6;
  }

  .mono {
    font-family: 'Courier New', monospace;
  }

  .subtle {
    color: #718096;
    font-size: 0.9rem;
  }

  .maps-link {
    display: inline-flex;
    margin-top: 0.3rem;
    color: #2b6cb0;
    text-decoration: underline;
  }

  .actions {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .stale-warning {
    padding: 0.75rem 1rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 0.5rem;
    color: #78350f;
    font-size: 0.9rem;
  }
</style>
