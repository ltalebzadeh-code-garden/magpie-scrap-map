import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createResource } from '$lib/server/resources';
import { getSupabaseClient } from '$lib/server/supabase';
import {
  buildCreateResourceInputFromFormValues,
  readAddResourceFormValues
} from '$lib/offline/create-resource-payload';
import type {
  ResourceCategory,
  ResourceStatus
} from '$lib/types';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RESOURCE_PHOTOS_BUCKET = 'resource-photos';

function toNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string') {
    return Number.NaN;
  }

  return Number.parseFloat(value);
}

function getPhotoExtension(file: File): string {
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'bin';
}

async function uploadPhotoIfPresent(file: File): Promise<{ ok: true; photoUrl: string } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const ext = getPhotoExtension(file);
  const path = `public/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(RESOURCE_PHOTOS_BUCKET)
    .upload(path, fileBuffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600'
    });

  if (uploadError) {
    return {
      ok: false,
      message:
        'Photo upload failed. Please try a smaller JPG/PNG/WebP image, or submit without a photo.'
    };
  }

  const { data } = supabase.storage.from(RESOURCE_PHOTOS_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    return {
      ok: false,
      message: 'Photo uploaded but URL could not be generated. Please try again.'
    };
  }

  return {
    ok: true,
    photoUrl: data.publicUrl
  };
}

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const photoEntry = formData.get('photo');
    const photoFile = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;

    const values = readAddResourceFormValues(formData);

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
      !Number.isFinite(toNumber(values.latitude)) ||
      !Number.isFinite(toNumber(values.longitude))
    ) {
      fieldErrors.location = 'Please set a valid location before submitting.';
    }

    if (photoFile) {
      if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
        fieldErrors.photo = 'Only JPG, PNG, or WebP images are supported.';
      }

      if (photoFile.size > MAX_PHOTO_SIZE_BYTES) {
        fieldErrors.photo = 'Photo must be 5MB or smaller.';
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        success: false,
        message: 'Please fix the highlighted fields and try again.',
        fieldErrors,
        values
      });
    }

    const payload = buildCreateResourceInputFromFormValues(values);

    if (photoFile) {
      const uploadResult = await uploadPhotoIfPresent(photoFile);

      if (!uploadResult.ok) {
        return fail(500, {
          success: false,
          message: uploadResult.message,
          fieldErrors: {
            photo: uploadResult.message
          },
          values
        });
      }

      payload.photo_url = uploadResult.photoUrl;
      values.photo_url = uploadResult.photoUrl;
    }

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
        location_accuracy: 'approximate',
        photo_url: ''
      }
    };
  }
};
