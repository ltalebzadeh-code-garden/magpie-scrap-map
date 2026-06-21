import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createResource } from '$lib/server/resources';
import type {
  CreateResourceInput,
  LocationAccuracy,
  ResourceCategory,
  ResourceStatus
} from '$lib/types';

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
      contact_method: String(formData.get('contact_method') ?? ''),
      location_method: String(formData.get('location_method') ?? 'gps'),
      manual_area: String(formData.get('manual_area') ?? ''),
      location_accuracy: String(formData.get('location_accuracy') ?? 'approximate')
    };

    const locationMethod = values.location_method;
    const manualArea = values.manual_area.trim();

    const fieldErrors: Record<string, string> = {};

    if (!['gps', 'map', 'manual'].includes(locationMethod)) {
      fieldErrors.location = 'Please choose a valid location method.';
    }

    if (locationMethod === 'manual' && !manualArea) {
      fieldErrors.manual_area = 'Please enter an approximate area for manual location.';
    }

    if (
      !Number.isFinite(toNumber(formData.get('latitude'))) ||
      !Number.isFinite(toNumber(formData.get('longitude')))
    ) {
      fieldErrors.location = 'Please set a valid location before submitting.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        success: false,
        message: 'Please fix the highlighted fields and try again.',
        fieldErrors,
        values
      });
    }

    const locationAccuracy: LocationAccuracy =
      locationMethod === 'manual'
        ? 'area_only'
        : values.location_accuracy === 'exact' || values.location_accuracy === 'approximate'
          ? values.location_accuracy
          : 'exact';

    const payload: CreateResourceInput = {
      title: values.title,
      description: values.description,
      category: values.category as ResourceCategory,
      status: values.status as ResourceStatus,
      latitude: toNumber(formData.get('latitude')),
      longitude: toNumber(formData.get('longitude')),
      contact_method: values.contact_method || undefined,
      location_accuracy: locationAccuracy
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
        contact_method: '',
        location_method: 'gps',
        manual_area: '',
        location_accuracy: 'approximate'
      }
    };
  }
};
