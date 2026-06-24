import type { PendingPostSyncStatus, PendingResourcePost } from './db';
import {
  listPendingPosts,
  removePendingPost,
  updatePendingPostSyncState
} from './sync-queue';

type SyncAttemptResult = {
  ok: boolean;
  networkFailure: boolean;
  message?: string;
  remoteResourceId?: string;
};

export type SyncRunResult = {
  attempted: number;
  synced: number;
  failed: number;
  leftPending: number;
  skipped: boolean;
};

let activeSyncRun: Promise<SyncRunResult> | null = null;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Unknown sync error.';
}

function isLikelyNetworkFailure(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('fetch')
  );
}

function payloadToFormData(item: PendingResourcePost): FormData {
  const formData = new FormData();
  const payload = item.payload;

  formData.set('title', payload.title);
  formData.set('description', payload.description);
  formData.set('category', payload.category);
  formData.set('status', payload.status);
  formData.set('latitude', String(payload.latitude));
  formData.set('longitude', String(payload.longitude));
  formData.set('contact_method', payload.contact_method ?? '');
  formData.set('location_method', payload.location_method);
  formData.set('manual_area', payload.manual_area ?? '');
  formData.set('location_accuracy', payload.location_accuracy ?? 'exact');

  return formData;
}

async function submitPendingPost(item: PendingResourcePost): Promise<SyncAttemptResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      ok: false,
      networkFailure: true,
      message: 'You are offline.'
    };
  }

  try {
    const response = await fetch('/add?/create', {
      method: 'POST',
      body: payloadToFormData(item),
      headers: {
        accept: 'application/json',
        'x-sveltekit-action': 'true'
      }
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        networkFailure: false,
        message: `Unexpected sync response (HTTP ${response.status}).`
      };
    }

    const result = (await response.json()) as {
      type?: string;
      data?: {
        message?: string;
        created?: {
          id?: string;
        };
      };
      error?: {
        message?: string;
      };
    };

    if (result.type === 'success') {
      return {
        ok: true,
        networkFailure: false,
        remoteResourceId: result.data?.created?.id
      };
    }

    return {
      ok: false,
      networkFailure: false,
      message:
        result.data?.message ??
        result.error?.message ??
        `Sync failed (HTTP ${response.status}).`
    };
  } catch (error) {
    return {
      ok: false,
      networkFailure: isLikelyNetworkFailure(error),
      message: toErrorMessage(error)
    };
  }
}

async function processPendingPost(item: PendingResourcePost): Promise<'synced' | 'failed' | 'pending'> {
  await updatePendingPostSyncState(item.id, {
    syncStatus: 'syncing',
    lastSyncError: null
  });

  const result = await submitPendingPost(item);

  if (result.ok) {
    await updatePendingPostSyncState(item.id, {
      syncStatus: 'synced',
      lastSyncError: null,
      remoteResourceId: result.remoteResourceId
    });

    await removePendingPost(item.id);
    return 'synced';
  }

  const nextSyncStatus: PendingPostSyncStatus = result.networkFailure ? 'pending' : 'failed';

  await updatePendingPostSyncState(item.id, {
    syncStatus: nextSyncStatus,
    lastSyncError: result.message ?? 'Sync failed.'
  });

  return nextSyncStatus === 'failed' ? 'failed' : 'pending';
}

function withSingleFlight(task: () => Promise<SyncRunResult>): Promise<SyncRunResult> {
  if (activeSyncRun) {
    return activeSyncRun;
  }

  activeSyncRun = task().finally(() => {
    activeSyncRun = null;
  });

  return activeSyncRun;
}

export function isSyncRunInFlight(): boolean {
  return activeSyncRun !== null;
}

export async function retryPendingPostSync(id: string): Promise<SyncRunResult> {
  return withSingleFlight(async () => {
    const items = await listPendingPosts();
    const item = items.find((entry) => entry.id === id);

    if (!item) {
      return {
        attempted: 0,
        synced: 0,
        failed: 0,
        leftPending: 0,
        skipped: true
      };
    }

    const outcome = await processPendingPost(item);

    return {
      attempted: 1,
      synced: outcome === 'synced' ? 1 : 0,
      failed: outcome === 'failed' ? 1 : 0,
      leftPending: outcome === 'pending' ? 1 : 0,
      skipped: false
    };
  });
}

export async function runPendingPostsSync(): Promise<SyncRunResult> {
  return withSingleFlight(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        attempted: 0,
        synced: 0,
        failed: 0,
        leftPending: 0,
        skipped: true
      };
    }

    const items = await listPendingPosts();
    const candidates = items.filter(
      (item) => item.syncStatus === 'pending' || item.syncStatus === 'failed'
    );

    let synced = 0;
    let failed = 0;
    let leftPending = 0;

    for (const item of candidates) {
      const outcome = await processPendingPost(item);

      if (outcome === 'synced') {
        synced += 1;
      } else if (outcome === 'failed') {
        failed += 1;
      } else {
        leftPending += 1;
      }
    }

    return {
      attempted: candidates.length,
      synced,
      failed,
      leftPending,
      skipped: false
    };
  });
}