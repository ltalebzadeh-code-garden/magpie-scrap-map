import type { PageServerLoad } from './$types';
import { fetchRecentResources } from '$lib/server/resources';
import { redirect } from '@sveltejs/kit';
import { resolveTab, tabRoutes, type TabId } from '$lib/navigation/tabs';

export const load: PageServerLoad = async ({ url }) => {
  const requestedTab = url.searchParams.get('tab');
  const tab: TabId = resolveTab(requestedTab);

  if (tab !== 'map') {
    redirect(307, tabRoutes[tab]);
  }

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
