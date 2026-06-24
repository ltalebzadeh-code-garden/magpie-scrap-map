import type { CreateResourceInput, LocationAccuracy } from '$lib/types';
import type {
  PendingLocationMethod,
  PendingPhotoReference,
  PendingResourceCreatePayload
} from './db';

export type AddResourceFormValues = {
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: string;
  longitude: string;
  contact_method: string;
  location_method: string;
  manual_area: string;
  location_accuracy: string;
  photo_url: string;
};

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

function normalizeLocationMethod(value: string): PendingLocationMethod {
  if (value === 'gps' || value === 'map' || value === 'manual') {
    return value;
  }

  return 'gps';
}

export function resolveLocationAccuracy(
  locationMethod: PendingLocationMethod,
  locationAccuracy: string
): LocationAccuracy {
  if (locationMethod === 'manual') {
    return 'area_only';
  }

  if (locationAccuracy === 'exact' || locationAccuracy === 'approximate') {
    return locationAccuracy;
  }

  return 'exact';
}

export function readAddResourceFormValues(formData: FormData): AddResourceFormValues {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? 'other'),
    status: String(formData.get('status') ?? 'available'),
    latitude: String(formData.get('latitude') ?? ''),
    longitude: String(formData.get('longitude') ?? ''),
    contact_method: String(formData.get('contact_method') ?? ''),
    location_method: String(formData.get('location_method') ?? 'gps'),
    manual_area: String(formData.get('manual_area') ?? ''),
    location_accuracy: String(formData.get('location_accuracy') ?? 'approximate'),
    photo_url: ''
  };
}

export function buildCreateResourceInputFromFormValues(values: AddResourceFormValues): CreateResourceInput {
  const locationMethod = normalizeLocationMethod(values.location_method);

  return {
    title: values.title,
    description: values.description,
    category: values.category as CreateResourceInput['category'],
    status: values.status as CreateResourceInput['status'],
    latitude: toNumber(values.latitude),
    longitude: toNumber(values.longitude),
    contact_method: values.contact_method || undefined,
    location_accuracy: resolveLocationAccuracy(locationMethod, values.location_accuracy)
  };
}

export function buildPendingResourcePayloadFromFormValues(
  values: AddResourceFormValues
): PendingResourceCreatePayload {
  const locationMethod = normalizeLocationMethod(values.location_method);
  const payload: PendingResourceCreatePayload = {
    ...buildCreateResourceInputFromFormValues(values),
    location_method: locationMethod
  };

  const manualArea = values.manual_area.trim();
  if (manualArea) {
    payload.manual_area = manualArea;
  }

  return payload;
}

export function toPendingPhotoReference(file: File): PendingPhotoReference {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  };
}
