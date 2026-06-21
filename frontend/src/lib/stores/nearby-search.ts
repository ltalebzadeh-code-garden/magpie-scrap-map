import { writable, derived, get } from 'svelte/store';
import { getLocation, getLocationErrorMessage } from '$lib/utils';
import type {
  NearbyResource,
  ResourceCategory,
  ResourceStatus,
  ResourceSummary,
  SearchNearbyParams
} from '$lib/types';

export type NearbyListItem = {
  id: string;
  title: string;
  category: ResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  created_at: string;
  distance?: number;
};

export const nearbyRadiusOptions = [
  { label: '1 km', value: 1000 },
  { label: '5 km', value: 5000 },
  { label: '20 km', value: 20000 }
] as const;

export const nearbyStatusOptions: ResourceStatus[] = ['available', 'claimed', 'possibly_gone', 'expired'];

export function formatDistance(meters?: number | null) {
  if (!Number.isFinite(meters)) return null;

  const distance = meters as number;

  if (distance < 1000) {
    return `${Math.round(distance)} m away`;
  }

  return `${(distance / 1000).toFixed(1)} km away`;
}

type PrimaryResource = NearbyResource | (ResourceSummary & { distance?: number });

export function createNearbySearchController(initialResources: PrimaryResource[] = []) {
  const selectedRadius = writable<number>(nearbyRadiusOptions[1]?.value ?? 5000);
  const selectedCategory = writable<ResourceCategory | ''>('');
  const selectedStatus = writable<ResourceStatus | ''>('');
  const searchLatitude = writable<number | null>(null);
  const searchLongitude = writable<number | null>(null);
  const locationError = writable<string | null>(null);
  const nearbyResources = writable<NearbyResource[] | null>(null);
  const isLoadingNearby = writable(false);
  const nearbyError = writable<string | null>(null);
  const hasAttemptedNearby = writable(false);

  const primaryResources = derived(nearbyResources, ($nearby) => $nearby ?? initialResources);

  const listItems = derived(primaryResources, ($resources) =>
    $resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      category: resource.category,
      status: resource.status,
      latitude: resource.latitude,
      longitude: resource.longitude,
      created_at: resource.created_at,
      distance:
        'distance_meters' in resource
          ? (resource as NearbyResource).distance_meters
          : resource.distance
    }))
  );

  const hasNearbyResults = derived(nearbyResources, ($nearby) => Array.isArray($nearby) && $nearby.length > 0);

  const primaryCount = derived(primaryResources, ($resources) => $resources.length);

  const resultsBadgeLabel = derived([nearbyResources], ([$nearby]) =>
    $nearby ? `${$nearby.length} nearby` : `${initialResources.length} recent`
  );

  const showEmptyNearby = derived(
    [hasAttemptedNearby, isLoadingNearby, nearbyError, hasNearbyResults],
    ([$attempted, $loading, $error, $hasResults]) => $attempted && !$loading && !$error && !$hasResults
  );

  function setCoordinates(latitude: number, longitude: number) {
    searchLatitude.set(latitude);
    searchLongitude.set(longitude);
  }

  async function requestLocation() {
    locationError.set(null);

    try {
      const location = await getLocation({ enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
      setCoordinates(location.latitude, location.longitude);
      await fetchNearby();
    } catch (error) {
      locationError.set(getLocationErrorMessage(error as GeolocationPositionError | Error));
    }
  }

  async function fetchNearby() {
    const latitude = get(searchLatitude);
    const longitude = get(searchLongitude);

    if (latitude == null || longitude == null) {
      locationError.set('Select a location before searching nearby resources.');
      return;
    }

    isLoadingNearby.set(true);
    nearbyError.set(null);
    hasAttemptedNearby.set(true);

    const payload: SearchNearbyParams = {
      latitude,
      longitude,
      radius_meters: Number(get(selectedRadius)),
      category: get(selectedCategory) || undefined,
      status: get(selectedStatus) || undefined,
      limit: 100
    };

    try {
      const response = await fetch('/api/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: { message: 'Nearby search failed.' } }));
        nearbyResources.set(null);
        nearbyError.set(errorPayload?.error?.message ?? 'Nearby search failed.');
        isLoadingNearby.set(false);
        return;
      }

      const json = (await response.json()) as { data: NearbyResource[] };
      nearbyResources.set(json.data);
    } catch (error) {
      nearbyResources.set(null);
      nearbyError.set((error as Error)?.message ?? 'Nearby search failed.');
    } finally {
      isLoadingNearby.set(false);
    }
  }

  function clearNearby() {
    nearbyResources.set(null);
    nearbyError.set(null);
    hasAttemptedNearby.set(false);
  }

  return {
    stores: {
      selectedRadius,
      selectedCategory,
      selectedStatus,
      searchLatitude,
      searchLongitude,
      locationError,
      nearbyResources,
      primaryResources,
      listItems,
      isLoadingNearby,
      nearbyError,
      hasAttemptedNearby,
      hasNearbyResults,
      showEmptyNearby,
      resultsBadgeLabel,
      primaryCount
    },
    actions: {
      requestLocation,
      fetchNearby,
      clearNearby,
      setCoordinates
    }
  };
}