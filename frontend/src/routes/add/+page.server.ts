import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createResource } from '$lib/server/resources';
import type { CreateResourceInput, ResourceCategory, ResourceStatus } from '$lib/types';

function toNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string') {
    return Number.NaN;
  }

  return Number.parseFloat(value);
}

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const values = {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      category: String(formData.get('category') ?? 'other'),
      status: String(formData.get('status') ?? 'available'),
      latitude: String(formData.get('latitude') ?? ''),
      longitude: String(formData.get('longitude') ?? ''),
      contact_method: String(formData.get('contact_method') ?? '')
    };

    const payload: CreateResourceInput = {
      title: values.title,
      description: values.description,
      category: values.category as ResourceCategory,
      status: values.status as ResourceStatus,
      latitude: toNumber(formData.get('latitude')),
      longitude: toNumber(formData.get('longitude')),
      contact_method: values.contact_method || undefined,
      location_accuracy: 'approximate'
    };

    const result = await createResource(payload);

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
      created: {
        id: result.data.id,
        title: result.data.title
      },
      values: {
        title: '',
        description: '',
        category: 'other',
        status: 'available',
        latitude: '',
        longitude: '',
        contact_method: ''
      }
    };
  }
};
