import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchResourceById } from '$lib/server/resources';

export const load: PageServerLoad = async ({ params }) => {
  const result = await fetchResourceById(params.id);

  if (!result.ok) {
    if (result.error.message === 'Resource not found.') {
      throw error(404, result.error.message);
    }

    if (result.error.code === 'VALIDATION_ERROR') {
      throw error(400, result.error.message);
    }

    throw error(500, result.error.message);
  }

  return {
    resource: result.data
  };
};
