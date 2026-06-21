import type { NearbyResource } from '$lib/types';

const DB_NAME = 'magpie-nearby-cache';
const DB_VERSION = 1;
const STORE_NAME = 'nearby-results';
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

type CacheKey = {
  latitude: number;
  longitude: number;
  radius_meters: number;
  category?: string;
  status?: string;
};

type CachedResult = {
  key: string;
  data: NearbyResource[];
  timestamp: number;
};

function generateCacheKey(params: CacheKey): string {
  return `${params.latitude.toFixed(5)}_${params.longitude.toFixed(5)}_${params.radius_meters}_${params.category || 'all'}_${params.status || 'all'}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

export async function getCachedNearby(params: CacheKey): Promise<NearbyResource[] | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = generateCacheKey(params);

    return new Promise((resolve) => {
      const request = store.get(key);

      request.onsuccess = () => {
        const cached = request.result as CachedResult | undefined;

        if (!cached) {
          resolve(null);
          return;
        }

        const age = Date.now() - cached.timestamp;
        if (age > CACHE_DURATION_MS) {
          resolve(null);
          return;
        }

        resolve(cached.data);
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedNearby(params: CacheKey, data: NearbyResource[]): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = generateCacheKey(params);

    const cached: CachedResult = {
      key,
      data,
      timestamp: Date.now()
    };

    store.put(cached);
  } catch {
    // Silent fail — caching is opportunistic
  }
}
