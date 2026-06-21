import type { PageServerLoad } from './$types';
import type { NearbyResource } from '$lib/types';
import { fetchRecentResources } from '$lib/server/resources';

export const load: PageServerLoad = async () => {
  const result = await fetchRecentResources(50);

  if (!result.ok) {
    return {
      initialResources: [] satisfies NearbyResource[],
      fetchError: result.error.message
    };
  }

  return {
    initialResources: result.data as NearbyResource[],
    fetchError: null
  };
};
