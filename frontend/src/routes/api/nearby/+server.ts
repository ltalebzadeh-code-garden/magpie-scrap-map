import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchNearbyResources } from '$lib/server/resources';
import type { SearchNearbyParams } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  let payload: Partial<SearchNearbyParams> | null = null;

  try {
    payload = (await request.json()) as Partial<SearchNearbyParams>;
  } catch (error) {
    return json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid JSON payload.'
        }
      },
      { status: 400 }
    );
  }

  if (!payload) {
    return json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing request body.'
        }
      },
      { status: 400 }
    );
  }

  const result = await searchNearbyResources(payload as SearchNearbyParams);

  if (!result.ok) {
    return json(
      { error: result.error },
      { status: result.error.code === 'VALIDATION_ERROR' ? 400 : 500 }
    );
  }

  return json({ data: result.data });
};