import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchResourceById, updateResourceStatus } from '$lib/server/resources';
import type { ResourceStatus } from '$lib/types';

const reportableStatuses: ResourceStatus[] = ['claimed', 'possibly_gone'];

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

export const actions: Actions = {
  updateStatus: async ({ request }) => {
    const formData = await request.formData();
    const id = String(formData.get('id') || '');
    const status = String(formData.get('status') || '') as ResourceStatus;

    if (!reportableStatuses.includes(status)) {
      return fail(400, {
        message: 'That status cannot be reported from this page.'
      });
    }

    const result = await updateResourceStatus({ id, status });

    if (!result.ok) {
      return fail(result.error.code === 'VALIDATION_ERROR' ? 400 : 500, {
        message: result.error.message
      });
    }

    return {
      success: true,
      message: 'Thanks — the community status report was saved.',
      status: result.data.status,
      updated_at: result.data.updated_at
    };
  }
};
