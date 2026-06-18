<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ResourceStatus, ResourceCategory } from '$lib/types';

  type BadgeVariant = 'status' | 'category' | 'info' | 'warning' | 'success' | 'error';

  type BadgeProps = {
    variant?: BadgeVariant;
    status?: ResourceStatus;
    category?: ResourceCategory;
    size?: 'small' | 'medium';
    children?: Snippet;
  };

  const {
    variant = 'info',
    status = undefined,
    category = undefined,
    size = 'medium',
    children
  }: BadgeProps = $props();

  const statusClassMap: Record<ResourceStatus, string> = {
    available: 'status-available',
    claimed: 'status-claimed',
    possibly_gone: 'status-possibly-gone',
    expired: 'status-expired'
  };

  const categoryClassMap: Record<ResourceCategory, string> = {
    scrap_metal: 'category-metal',
    wood: 'category-wood',
    tools: 'category-tools',
    electrical: 'category-electrical',
    plumbing: 'category-plumbing',
    containers: 'category-containers',
    building_materials: 'category-building',
    fuel: 'category-fuel',
    other: 'category-other'
  };

  const statusLabelMap: Record<ResourceStatus, string> = {
    available: 'Available',
    claimed: 'Claimed',
    possibly_gone: 'Possibly Gone',
    expired: 'Expired'
  };

  const categoryLabelMap: Record<ResourceCategory, string> = {
    scrap_metal: 'Scrap Metal',
    wood: 'Wood',
    tools: 'Tools',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    containers: 'Containers',
    building_materials: 'Building Materials',
    fuel: 'Fuel',
    other: 'Other'
  };

  const effectiveVariant = $derived(status ? 'status' : category ? 'category' : variant);
  const statusClass = $derived(status ? statusClassMap[status] : '');
  const categoryClass = $derived(category ? categoryClassMap[category] : '');
  const displayText = $derived(status ? statusLabelMap[status] : category ? categoryLabelMap[category] : '');
</script>

<span
  class="badge"
  class:small={size === 'small'}
  class:medium={size === 'medium'}
  class:info={effectiveVariant === 'info'}
  class:warning={effectiveVariant === 'warning'}
  class:success={effectiveVariant === 'success'}
  class:error={effectiveVariant === 'error'}
  class:status={effectiveVariant === 'status'}
  class:category={effectiveVariant === 'category'}
  class:status-available={statusClass === 'status-available'}
  class:status-claimed={statusClass === 'status-claimed'}
  class:status-possibly-gone={statusClass === 'status-possibly-gone'}
  class:status-expired={statusClass === 'status-expired'}
  class:category-metal={categoryClass === 'category-metal'}
  class:category-wood={categoryClass === 'category-wood'}
  class:category-tools={categoryClass === 'category-tools'}
  class:category-electrical={categoryClass === 'category-electrical'}
  class:category-plumbing={categoryClass === 'category-plumbing'}
  class:category-containers={categoryClass === 'category-containers'}
  class:category-building={categoryClass === 'category-building'}
  class:category-fuel={categoryClass === 'category-fuel'}
  class:category-other={categoryClass === 'category-other'}
>
  {#if displayText}
    {displayText}
  {:else}
    {@render children?.()}
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    font-weight: 600;
    border-radius: 0.25rem;
    white-space: nowrap;
    user-select: none;
  }

  /* Sizes */
  .small {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .medium {
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
  }

  /* Generic variants */
  .info {
    background: #bee3f8;
    color: #2c5282;
  }

  .warning {
    background: #feebc8;
    color: #7c2d12;
  }

  .success {
    background: #c6f6d5;
    color: #22543d;
  }

  .error {
    background: #fed7d7;
    color: #742a2a;
  }

  /* Status variants */
  .status-available {
    background: #c6f6d5;
    color: #22543d;
  }

  .status-claimed {
    background: #bee3f8;
    color: #2c5282;
  }

  .status-possibly-gone {
    background: #feebc8;
    color: #7c2d12;
  }

  .status-expired {
    background: #e2e8f0;
    color: #4a5568;
  }

  /* Category variants */
  .category-metal {
    background: #e2e8f0;
    color: #2d3748;
  }

  .category-wood {
    background: #feebc8;
    color: #7c2d12;
  }

  .category-tools {
    background: #bee3f8;
    color: #2c5282;
  }

  .category-electrical {
    background: #fef5e7;
    color: #975a16;
  }

  .category-plumbing {
    background: #e0e7ff;
    color: #3730a3;
  }

  .category-containers {
    background: #f3e8ff;
    color: #6b21a8;
  }

  .category-building {
    background: #fed7d7;
    color: #742a2a;
  }

  .category-fuel {
    background: #fce7f3;
    color: #831843;
  }

  .category-other {
    background: #e2e8f0;
    color: #4a5568;
  }
</style>
