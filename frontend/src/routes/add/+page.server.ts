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
const PHOTO_UPLOAD_WARNING = 'عکس بارگذاری نشد. منبع بدون عکس ثبت شد.';

type PhotoUploadResult =
  | { ok: true; photoUrl: string; photoPath: string }
  | { ok: false; message: string };

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

async function uploadPhotoIfPresent(file: File): Promise<PhotoUploadResult> {
  try {
    console.log('Uploading photo:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const supabase = getSupabaseClient();
    const ext = getPhotoExtension(file);
    const path = `public/${crypto.randomUUID()}.${ext}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(RESOURCE_PHOTOS_BUCKET)
      .upload(path, fileBuffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600'
      });

    console.log('Upload result:', { uploadData, uploadError, path });

    if (uploadError) {
      console.warn('Photo upload failed; continuing without a photo.', {
        bucket: RESOURCE_PHOTOS_BUCKET,
        path,
        message: uploadError.message
      });

      return {
        ok: false,
        message: `Photo upload failed: ${uploadError.message}`
      };
    }

    const { data } = supabase.storage.from(RESOURCE_PHOTOS_BUCKET).getPublicUrl(path);

    console.log('Public URL result:', data);

    if (!data.publicUrl) {
      console.warn('Photo uploaded but public URL could not be generated; continuing without a photo.', {
        bucket: RESOURCE_PHOTOS_BUCKET,
        path
      });

      return {
        ok: false,
        message: 'Photo uploaded but URL could not be generated. Please try again.'
      };
    }

    return {
      ok: true,
      photoUrl: data.publicUrl,
      photoPath: path
    };
  } catch (error) {
    console.error('Photo upload exception:', error);
    return {
      ok: false,
      message: 'Photo upload failed.'
    };
  }
}


async function removeUploadedPhotoBestEffort(path: string): Promise<void> {
  try {
    await getSupabaseClient().storage.from(RESOURCE_PHOTOS_BUCKET).remove([path]);
  } catch {
    // Resource creation failure should stay the only user-facing error here.
  }
}

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const photoEntry = formData.get('photo');
    const photoFile = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;
    let uploadPhotoUrl: string | undefined;
    let uploadPhotoPath: string | undefined;
    let uploadWarning: string | undefined;

    const values = readAddResourceFormValues(formData);

    const locationMethod = values.location_method;
    const manualArea = values.manual_area.trim();

    const fieldErrors: Record<string, string> = {};

    if (!['gps', 'map', 'manual'].includes(locationMethod)) {
      fieldErrors.location = 'لطفا یک روش معتبر برای موقعیت انتخاب کنید.';
    }

    if (locationMethod === 'manual' && !manualArea) {
      fieldErrors.manual_area = 'برای موقعیت دستی، لطفا محدوده تقریبی را وارد کنید.';
    }

    if (
      !Number.isFinite(toNumber(values.latitude)) ||
      !Number.isFinite(toNumber(values.longitude))
    ) {
      fieldErrors.location = 'لطفا قبل از ثبت، یک موقعیت معتبر تنظیم کنید.';
    }

    if (photoFile) {
      if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
        fieldErrors.photo = 'فقط تصویرهای JPG، PNG یا WebP پشتیبانی می‌شوند.';
      }

      if (photoFile.size > MAX_PHOTO_SIZE_BYTES) {
        fieldErrors.photo = 'حجم عکس باید ۵ مگابایت یا کمتر باشد.';
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        success: false,
        message: 'لطفا فیلدهای مشخص‌شده را اصلاح کنید و دوباره تلاش کنید.',
        fieldErrors,
        values
      });
    }

    const payload = buildCreateResourceInputFromFormValues(values);

    if (photoFile) {
      const uploadResult = await uploadPhotoIfPresent(photoFile);

      if (uploadResult.ok) {
        uploadPhotoUrl = uploadResult.photoUrl;
        uploadPhotoPath = uploadResult.photoPath;
      } else {
        console.warn('Creating resource without uploaded photo.', {
          reason: uploadResult.message
        });
        uploadWarning = PHOTO_UPLOAD_WARNING;
        values.photo_url = '';
      }
    }

    if (uploadPhotoUrl) {
      payload.photo_url = uploadPhotoUrl;
      values.photo_url = uploadPhotoUrl;
    }

    const result = await createResource(payload);

    if (!result.ok) {
      if (uploadPhotoPath) {
        await removeUploadedPhotoBestEffort(uploadPhotoPath);
      }

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
      warning: uploadWarning,
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
