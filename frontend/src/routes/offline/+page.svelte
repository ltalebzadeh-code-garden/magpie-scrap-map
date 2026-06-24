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
    return new Date(iso).toLocaleString();
  }

  async function refreshPendingPosts() {
    isLoading = true;
    pageError = '';

    try {
      pendingPosts = await listPendingPosts();
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'Failed to load queued posts.';
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
        pageMessage = 'Queued post synced successfully.';
      } else if (result.leftPending > 0) {
        pageMessage = 'Still offline. Queued post remains pending.';
      } else if (result.failed > 0) {
        pageError = 'Retry failed. Please review the item error and try again.';
      }
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'Retry failed.';
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
      pageMessage = 'Queued post removed.';
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'Could not remove queued post.';
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
    <h2>Offline Queue</h2>
    <p class="subtext">Queued submissions are stored locally and synced when you are online.</p>

    {#if $isOnline}
      <p class="info-note">✓ Online - reconnect/app resume sync is active</p>
    {:else}
      <p class="offline-note">⚠️ Offline - new submissions stay queued locally</p>
    {/if}

    {#if pageMessage}
      <p class="success-message">{pageMessage}</p>
    {/if}

    {#if pageError}
      <p class="error-message">{pageError}</p>
    {/if}

    {#if isLoading}
      <p class="muted">Loading queued posts…</p>
    {:else if pendingPosts.length === 0}
      <p class="muted">No queued posts.</p>
    {:else}
      <ul class="queue-list">
        {#each pendingPosts as post}
          <li class="queue-item">
            <div class="item-main">
              <p class="title">{post.payload.title}</p>
              <p class="meta">
                <span>Status: <strong>{post.syncStatus}</strong></span>
                <span>Queued: {formatDate(post.createdAt)}</span>
              </p>
              {#if post.lastSyncError}
                <p class="item-error">Last error: {post.lastSyncError}</p>
              {/if}
              {#if post.photo}
                <p class="photo-note">Photo metadata queued ({post.photo.name}); upload on sync is currently limited.</p>
              {/if}
            </div>
            <div class="item-actions">
              <button
                type="button"
                class="action action-retry"
                disabled={busyPostId !== null || post.syncStatus === 'syncing'}
                onclick={() => retryPost(post.id)}
              >
                Retry
              </button>
              <button
                type="button"
                class="action action-remove"
                disabled={busyPostId !== null || post.syncStatus === 'syncing'}
                onclick={() => removePost(post.id)}
              >
                Remove
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
