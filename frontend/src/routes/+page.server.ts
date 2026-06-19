import type { PageServerLoad } from './$types';
import { fetchRecentResources } from '$lib/server/resources';

export const load: PageServerLoad = async () => {
  const result = await fetchRecentResources(100);

  if (!result.ok) {
    return {
      resources: [],
      error: result.error.message
    };
  }

  return {
    resources: result.data,
    error: null
  };
};
