import { browser } from '$app/environment';
import Dexie, { type Table } from 'dexie';
import type { CreateResourceInput } from '$lib/types';

export type PendingPostSyncStatus = 'pending' | 'syncing' | 'failed' | 'synced';

export type PendingLocationMethod = 'gps' | 'map' | 'manual';

export interface PendingResourceCreatePayload extends CreateResourceInput {
  location_method: PendingLocationMethod;
  manual_area?: string;
}

export interface PendingPhotoReference {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  objectUrl?: string;
  uploadedUrl?: string;
}

export interface PendingResourcePost {
  id: string;
  payload: PendingResourceCreatePayload;
  photo?: PendingPhotoReference;
  syncStatus: PendingPostSyncStatus;
  lastSyncError?: string;
  lastSyncAttemptAt?: string;
  remoteResourceId?: string;
  createdAt: string;
  updatedAt: string;
}

class MagpieOfflineDatabase extends Dexie {
  pendingPosts!: Table<PendingResourcePost, string>;

  constructor() {
    super('magpie-offline');

    this.version(1).stores({
      pendingPosts: 'id, syncStatus, createdAt, updatedAt'
    });
  }
}

const offlineDb = browser ? new MagpieOfflineDatabase() : null;

export function getOfflineDb(): MagpieOfflineDatabase {
  if (!offlineDb) {
    throw new Error('Offline database is only available in the browser.');
  }

  return offlineDb;
}
