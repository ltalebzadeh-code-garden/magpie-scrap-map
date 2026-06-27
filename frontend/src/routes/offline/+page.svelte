<script lang="ts">
  import { onMount } from 'svelte';
  import { isOnline } from '$lib/stores';
  import type { PendingResourcePost } from '$lib/offline/db';
  import { listPendingPosts, removePendingPost } from '$lib/offline/sync-queue';
  import { retryPendingPostSync } from '$lib/offline/sync-runner';

  let pendingPosts = $state<PendingResourcePost[]>([]);
  let isLoading = $state(true);
  let busyPostId = $state<string | null>(null);
  let pageMessage = $state('');
  let pageError = $state('');

  function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(iso));
  }

  async function refreshPendingPosts() {
    isLoading = true;
    pageError = '';

    try {
      pendingPosts = await listPendingPosts();
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'بارگذاری ارسال‌های در صف با خطا مواجه شد.';
    } finally {
      isLoading = false;
    }
  }

  async function retryPost(id: string) {
    if (busyPostId) return;

    busyPostId = id;
    pageError = '';
    pageMessage = '';

    try {
      const result = await retryPendingPostSync(id);

      if (result.synced > 0) {
        pageMessage = 'ارسال در صف با موفقیت همگام شد.';
      } else if (result.leftPending > 0) {
        pageMessage = 'هنوز آفلاین هستید. ارسال در صف باقی می‌ماند.';
      } else if (result.failed > 0) {
        pageError = 'تلاش مجدد ناموفق بود. لطفا خطای مورد را بررسی کنید و دوباره امتحان کنید.';
      }
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'تلاش مجدد ناموفق بود.';
    } finally {
      busyPostId = null;
      await refreshPendingPosts();
    }
  }

  async function removePost(id: string) {
    if (busyPostId) return;

    busyPostId = id;
    pageError = '';
    pageMessage = '';

    try {
      await removePendingPost(id);
      pageMessage = 'ارسال در صف حذف شد.';
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'امکان حذف ارسال در صف وجود نداشت.';
    } finally {
      busyPostId = null;
      await refreshPendingPosts();
    }
  }

  onMount(() => {
    void refreshPendingPosts();
  });
</script>

<div class="page">
  <div class="queue-card">
    <h2>صف آفلاین</h2>
    <p class="subtext">ارسال‌های در صف به‌صورت محلی ذخیره می‌شوند و هنگام آنلاین شدن همگام می‌شوند.</p>

    {#if $isOnline}
      <p class="info-note">✓ آنلاین - همگام‌سازی پس از اتصال مجدد/بازگشت به برنامه فعال است</p>
    {:else}
      <p class="offline-note">⚠️ آفلاین - ارسال‌های جدید به‌صورت محلی در صف می‌مانند</p>
    {/if}

    {#if pageMessage}
      <p class="success-message">{pageMessage}</p>
    {/if}

    {#if pageError}
      <p class="error-message">{pageError}</p>
    {/if}

    {#if isLoading}
      <p class="muted">در حال بارگذاری ارسال‌های در صف…</p>
    {:else if pendingPosts.length === 0}
      <p class="muted">ارسال در صفی وجود ندارد.</p>
    {:else}
      <ul class="queue-list">
        {#each pendingPosts as post}
          <li class="queue-item">
            <div class="item-main">
              <p class="title">{post.payload.title}</p>
              <p class="meta">
                <span>وضعیت: <strong>{post.syncStatus}</strong></span>
                <span>در صف: {formatDate(post.createdAt)}</span>
              </p>
              {#if post.lastSyncError}
                <p class="item-error">آخرین خطا: {post.lastSyncError}</p>
              {/if}
              {#if post.photo}
                <p class="photo-note"> عکس در صف قرار گرفت ({post.photo.name})؛ بارگذاری هنگام همگام‌سازی فعلا محدود است.</p>
              {/if}
            </div>
            <div class="item-actions">
              <button
                type="button"
                class="action action-retry"
                disabled={busyPostId !== null || post.syncStatus === 'syncing'}
                onclick={() => retryPost(post.id)}
              >
                تلاش مجدد
              </button>
              <button
                type="button"
                class="action action-remove"
                disabled={busyPostId !== null || post.syncStatus === 'syncing'}
                onclick={() => removePost(post.id)}
              >
                حذف
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .page {
    padding: 1rem 0;
  }

  .queue-card {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0;
    color: #2d3748;
  }

  .subtext,
  .muted {
    color: #718096;
  }

  .info-note {
    color: #2f855a;
    font-weight: 500;
  }

  .offline-note {
    color: #c53030;
    font-weight: 500;
  }

  .success-message {
    color: #2f855a;
    font-weight: 500;
  }

  .error-message {
    color: #c53030;
    font-weight: 500;
  }

  .queue-list {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.75rem;
  }

  .queue-item {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: flex-start;
  }

  .item-main {
    min-width: 0;
  }

  .title {
    margin: 0;
    font-weight: 600;
    color: #1a202c;
  }

  .meta {
    margin: 0.4rem 0;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    color: #4a5568;
    font-size: 0.9rem;
  }

  .item-error {
    margin: 0.35rem 0 0;
    color: #c53030;
    font-size: 0.9rem;
  }

  .photo-note {
    margin: 0.35rem 0 0;
    color: #744210;
    font-size: 0.85rem;
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action {
    border: 1px solid #cbd5e0;
    background: #fff;
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .action:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .action-retry {
    color: #2b6cb0;
  }

  .action-remove {
    color: #c53030;
  }
</style>
