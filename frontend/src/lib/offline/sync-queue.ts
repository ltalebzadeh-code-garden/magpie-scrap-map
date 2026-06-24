import {
  getOfflineDb,
  type PendingPhotoReference,
  type PendingPostSyncStatus,
  type PendingResourceCreatePayload,
  type PendingResourcePost
} from './db';

type AddPendingPostInput = {
  payload: PendingResourceCreatePayload;
  photo?: PendingPhotoReference;
};

type UpdatePendingPostSyncInput = {
  syncStatus: PendingPostSyncStatus;
  lastSyncError?: string | null;
  lastSyncAttemptAt?: string;
  remoteResourceId?: string;
};

type ListPendingPostsOptions = {
  syncStatus?: PendingPostSyncStatus;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createPendingPostId(): string {
  return crypto.randomUUID();
}

export async function addPendingPost(input: AddPendingPostInput): Promise<PendingResourcePost> {
  const db = getOfflineDb();
  const timestamp = nowIso();

  const pendingPost: PendingResourcePost = {
    id: createPendingPostId(),
    payload: input.payload,
    photo: input.photo,
    syncStatus: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.pendingPosts.add(pendingPost);

  return pendingPost;
}

export async function listPendingPosts(options: ListPendingPostsOptions = {}): Promise<PendingResourcePost[]> {
  const db = getOfflineDb();

  if (options.syncStatus) {
    const items = await db.pendingPosts.where('syncStatus').equals(options.syncStatus).toArray();
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return db.pendingPosts.orderBy('createdAt').reverse().toArray();
}

export async function updatePendingPostSyncState(
  id: string,
  updates: UpdatePendingPostSyncInput
): Promise<PendingResourcePost | null> {
  const db = getOfflineDb();
  const current = await db.pendingPosts.get(id);

  if (!current) {
    return null;
  }

  const next: PendingResourcePost = {
    ...current,
    syncStatus: updates.syncStatus,
    lastSyncError: updates.lastSyncError === null ? undefined : updates.lastSyncError ?? current.lastSyncError,
    lastSyncAttemptAt: updates.lastSyncAttemptAt ?? nowIso(),
    remoteResourceId: updates.remoteResourceId ?? current.remoteResourceId,
    updatedAt: nowIso()
  };

  await db.pendingPosts.put(next);

  return next;
}

export async function removePendingPost(id: string): Promise<void> {
  const db = getOfflineDb();
  await db.pendingPosts.delete(id);
}
