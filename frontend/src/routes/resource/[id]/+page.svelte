<script lang="ts">
  import { enhance } from '$app/forms';
  import { Badge, Card, Button } from '$lib/components/ui';
  import { categoryLabels, formatRelativeTime } from '$lib/utils';
  import { formatDateTime } from '$lib/utils/time';
  import type { Resource, ResourceStatus } from '$lib/types';

  type ResourceDetailData = {
    resource: Resource;
  };

  type StatusActionData = {
    success?: boolean;
    message?: string;
    status?: ResourceStatus;
    updated_at?: string;
  };

  type EnhanceSubmit = {
    formData: FormData;
    cancel: () => void;
  };

  type EnhanceResult = {
    update: () => Promise<void>;
  };

  let { data, form } = $props<{ data: ResourceDetailData; form?: StatusActionData }>();

  const resource = data.resource;
  const mapsHref = `https://www.google.com/maps?q=${resource.latitude},${resource.longitude}`;
  const statusActions: { status: ResourceStatus; label: string; confirmation: string }[] = [
    {
      status: 'claimed',
      label: 'ثبت به‌عنوان برداشته‌شده',
      confirmation: 'این منبع به‌عنوان برداشته‌شده ثبت شود؟'
    },
    {
      status: 'possibly_gone',
      label: 'گزارش احتمال ناپدید شدن',
      confirmation: 'این منبع به‌عنوان احتمالاً ناپدید شده گزارش شود؟'
    }
  ];

  let copyFeedback = $state('');
  let currentStatus = $state(resource.status);
  let isStatusPending = $state(false);

  $effect(() => {
    if (form?.success && form.status) {
      currentStatus = form.status;
    }
  });

  function copyLink() {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      copyFeedback = 'کپی پشتیبانی نمی‌شود';
      return;
    }

    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        copyFeedback = 'لینک کپی شد!';
        setTimeout(() => {
          copyFeedback = '';
        }, 2000);
      })
      .catch(() => {
        copyFeedback = 'کپی ناموفق بود';
        setTimeout(() => {
          copyFeedback = '';
        }, 2000);
      });
  }

  const isStale = $derived(
    currentStatus === 'expired' || (resource.expires_at && new Date(resource.expires_at) < new Date())
  );

  const confirmStatusUpdate = ({ formData, cancel }: EnhanceSubmit) => {
    const status = String(formData.get('status') || '') as ResourceStatus;
    const action = statusActions.find((item) => item.status === status);

    if (!action || !confirm(action.confirmation)) {
      cancel();
      return;
    }

    isStatusPending = true;

    return async ({ update }: EnhanceResult) => {
      try {
        await update();
      } finally {
        isStatusPending = false;
      }
    };
  };
</script>

<div class="detail-page">
  <Card padding="large" class="detail-card">
    {#if isStale}
      <div class="stale-warning">
        ⚠️ ممکن است این منبع دیگر در دسترس نباشد.
      </div>
    {/if}

    <div class="header-row">
      <div>
        <h1>{resource.title}</h1>
        <p class="meta-line">{formatRelativeTime(resource.created_at)}</p>
      </div>
      <div class="badges">
        <Badge category={resource.category} />
        <Badge status={currentStatus} />
      </div>
    </div>

    {#if resource.photo_url}
      <div class="photo-wrap">
        <img src={resource.photo_url} alt={`عکس مربوط به ${resource.title}`} loading="lazy" />
      </div>
    {/if}

    <section class="section">
      <h2>توضیحات</h2>
      <p>{resource.description}</p>
    </section>

    <section class="section">
      <h2>موقعیت</h2>
      <p class="mono">{resource.latitude.toFixed(6)}, {resource.longitude.toFixed(6)}</p>
      <p class="subtle">
        دقت: {resource.location_accuracy === 'area_only'
          ? 'ناحیه تقریبی'
          : resource.location_accuracy === 'approximate'
            ? 'نقطه تقریبی'
            : 'نقطه دقیق'}
      </p>
      <a class="maps-link" href={mapsHref} target="_blank" rel="noopener noreferrer">باز کردن در نقشه</a>
    </section>

    <section class="section">
      <h2>جزئیات</h2>
      <p><strong>دسته‌بندی:</strong> {categoryLabels[resource.category as keyof typeof categoryLabels]}</p>
      {#if resource.contact_method}
        <p><strong>تماس:</strong> {resource.contact_method}</p>
      {/if}
    </section>

    <section class="section status-report">
      <h2>گزارش وضعیت از طرف جامعه</h2>
      <p class="subtle">اگر این منبع قبلا برداشته شده یا ممکن است دیگر موجود نباشد، با گزارش خود به دیگران کمک کنید.</p>

      <form method="POST" action="?/updateStatus" use:enhance={confirmStatusUpdate}>
        <input type="hidden" name="id" value={resource.id} />
        <div class="status-actions">
          {#each statusActions as action}
            <Button type="submit" name="status" value={action.status} variant="ghost" disabled={isStatusPending}>
              {isStatusPending ? 'در حال ذخیره…' : action.label}
            </Button>
          {/each}
        </div>
      </form>

      {#if form?.message}
        <p class:success-message={form.success} class:error-message={!form.success}>{form.message}</p>
      {/if}
    </section>

    <div class="actions">
      <Button type="button" variant="ghost" on:click={() => history.back()}>بازگشت</Button>
      <Button type="button" on:click={copyLink}>
        {copyFeedback || 'کپی لینک'}
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

  .status-report {
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .status-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }

  .success-message,
  .error-message {
    margin-top: 0.75rem;
    font-size: 0.9rem;
  }

  .success-message {
    color: #166534;
  }

  .error-message {
    color: #b91c1c;
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
