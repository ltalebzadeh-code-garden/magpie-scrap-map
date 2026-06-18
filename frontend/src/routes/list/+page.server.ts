import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { fetchRecentResources, updateResourceStatus } from '$lib/server/resources';
import type { ResourceStatus } from '$lib/types';

export const load: PageServerLoad = async () => {
  const result = await fetchRecentResources(20);

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

export const actions: Actions = {
  updateStatus: async ({ request }) => {
    const formData = await request.formData();

    const values = {
      id: String(formData.get('id') ?? ''),
      status: String(formData.get('status') ?? '')
    };

    const result = await updateResourceStatus({
      id: values.id,
      status: values.status as ResourceStatus
    });

    if (!result.ok) {
      const status = result.error.code === 'VALIDATION_ERROR' ? 400 : 500;

      return fail(status, {
        success: false,
        message: result.error.message,
        fieldErrors: result.error.fieldErrors ?? {},
        values
      });
    }

    return {
      success: true,
      message: 'Resource status updated successfully.',
      updated: result.data,
      values
    };
  }
};
