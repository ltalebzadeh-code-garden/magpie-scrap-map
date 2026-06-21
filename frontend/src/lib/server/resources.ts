import type {
  CreateResourceInput,
  NearbyResource,
  Resource,
  ResourceCategory,
  ResourceStatus,
  ResourceSummary,
  SearchNearbyParams,
  UpdateResourceStatusInput
} from '$lib/types';
import { categoryList } from '$lib/utils';
import { getSupabaseClient } from './supabase';

type DbResourceCategory =
  | 'scrap_metal'
  | 'wood_lumber'
  | 'tools'
  | 'electrical'
  | 'plumbing'
  | 'containers_storage'
  | 'building_materials'
  | 'fuel_energy'
  | 'other';

type ServiceErrorCode = 'VALIDATION_ERROR' | 'DATABASE_ERROR';

interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type ServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ServiceError;
    };

const allowedStatuses: ResourceStatus[] = ['available', 'claimed', 'possibly_gone', 'expired'];

const appToDbCategory: Record<ResourceCategory, DbResourceCategory> = {
  scrap_metal: 'scrap_metal',
  wood: 'wood_lumber',
  tools: 'tools',
  electrical: 'electrical',
  plumbing: 'plumbing',
  containers: 'containers_storage',
  building_materials: 'building_materials',
  fuel: 'fuel_energy',
  other: 'other'
};

const dbToAppCategory: Record<DbResourceCategory, ResourceCategory> = {
  scrap_metal: 'scrap_metal',
  wood_lumber: 'wood',
  tools: 'tools',
  electrical: 'electrical',
  plumbing: 'plumbing',
  containers_storage: 'containers',
  building_materials: 'building_materials',
  fuel_energy: 'fuel',
  other: 'other'
};

type DbResourceRow = {
  id: string;
  title: string;
  description: string;
  category: DbResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  location_accuracy: 'exact' | 'approximate' | 'area_only';
  contact_method: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  device_id_hash: string | null;
};

type DbResourceSummaryRow = {
  id: string;
  title: string;
  category: DbResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  created_at: string;
};

type DbNearbyRow = {
  id: string;
  title: string;
  description: string;
  category: DbResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  location_accuracy: 'exact' | 'approximate' | 'area_only';
  contact_method: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  distance_meters: number;
};

export async function createResource(input: CreateResourceInput): Promise<ServiceResult<Resource>> {
  const supabase = getSupabaseClient();

  const validation = validateCreateResourceInput(input);
  if (!validation.ok) {
    return validation;
  }

  const payload = {
    title: validation.value.title,
    description: validation.value.description,
    category: appToDbCategory[validation.value.category],
    status: validation.value.status,
    latitude: validation.value.latitude,
    longitude: validation.value.longitude,
    location_accuracy: validation.value.location_accuracy,
    contact_method: validation.value.contact_method,
    photo_url: validation.value.photo_url
  };

  const { data, error } = await supabase
    .from('resources')
    .insert([payload] as never)
    .select('*')
    .single<DbResourceRow>();

  if (error || !data) {
    return {
      ok: false,
      error: {
        code: 'DATABASE_ERROR',
        message: error?.message || 'Failed to create resource.'
      }
    };
  }

  return {
    ok: true,
    data: mapDbResourceToApp(data)
  };
}

export async function fetchRecentResources(limit = 20): Promise<ServiceResult<ResourceSummary[]>> {
  const supabase = getSupabaseClient();

  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 20;

  const { data, error } = await supabase
    .from('resources')
    .select('id,title,category,status,latitude,longitude,created_at')
    .order('created_at', { ascending: false })
    .limit(safeLimit)
    .returns<DbResourceSummaryRow[]>();

  if (error || !data) {
    return {
      ok: false,
      error: {
        code: 'DATABASE_ERROR',
        message: error?.message || 'Failed to fetch recent resources.'
      }
    };
  }

  return {
    ok: true,
    data: data.map((row) => ({
      id: row.id,
      title: row.title,
      category: dbToAppCategory[row.category],
      status: row.status,
      latitude: row.latitude,
      longitude: row.longitude,
      created_at: row.created_at
    }))
  };
}

export async function searchNearbyResources(
  params: SearchNearbyParams
): Promise<ServiceResult<NearbyResource[]>> {
  const supabase = getSupabaseClient();

  const fieldErrors: Record<string, string> = {};

  if (!Number.isFinite(params.latitude) || params.latitude < -90 || params.latitude > 90) {
    fieldErrors.latitude = 'Latitude must be between -90 and 90.';
  }
  if (!Number.isFinite(params.longitude) || params.longitude < -180 || params.longitude > 180) {
    fieldErrors.longitude = 'Longitude must be between -180 and 180.';
  }
  if (!Number.isFinite(params.radius_meters) || params.radius_meters <= 0) {
    fieldErrors.radius_meters = 'Radius must be a positive number.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid search parameters.',
        fieldErrors
      }
    };
  }

  const safeLimit = Number.isFinite(params.limit) ? Math.max(1, Math.min(params.limit!, 200)) : 100;
  const dbCategory = params.category ? appToDbCategory[params.category] : null;

  const { data, error } = await (supabase as any).rpc('search_nearby_resources', {
    search_lat: params.latitude,
    search_lon: params.longitude,
    radius_meters: params.radius_meters,
    filter_category: dbCategory ?? null,
    filter_status: params.status ?? null,
    result_limit: safeLimit
  });

  if (error) {
    return {
      ok: false,
      error: { code: 'DATABASE_ERROR', message: error.message || 'Nearby search failed.' }
    };
  }

  const rows: DbNearbyRow[] = (data ?? []) as DbNearbyRow[];

  return {
    ok: true,
    data: rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: dbToAppCategory[row.category],
      status: row.status,
      latitude: row.latitude,
      longitude: row.longitude,
      location_accuracy: row.location_accuracy,
      contact_method: row.contact_method ?? undefined,
      photo_url: row.photo_url ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      expires_at: row.expires_at ?? undefined,
      distance_meters: row.distance_meters
    }))
  };
}

export async function updateResourceStatus(
  input: UpdateResourceStatusInput
): Promise<ServiceResult<Pick<Resource, 'id' | 'status' | 'updated_at'>>> {
  const supabase = getSupabaseClient();

  const validation = validateUpdateResourceStatusInput(input);
  if (!validation.ok) {
    return validation;
  }

  const { data, error } = await (supabase as any)
    .rpc('public_update_resource_status', {
      p_resource_id: validation.value.id,
      p_status: validation.value.status
    })
    .single();

  const typedData = data as { id: string; status: ResourceStatus; updated_at: string } | null;

  if (error || !typedData) {
    return {
      ok: false,
      error: {
        code: 'DATABASE_ERROR',
        message: error?.message || 'Failed to update resource status.'
      }
    };
  }

  return {
    ok: true,
    data: typedData
  };
}

function validateCreateResourceInput(input: CreateResourceInput):
  | { ok: true; value: CreateResourceInput }
  | { ok: false; error: ServiceError } {
  const fieldErrors: Record<string, string> = {};

  const title = input.title?.trim() || '';
  const description = input.description?.trim() || '';
  const contactMethod = input.contact_method?.trim() || '';
  const photoUrl = input.photo_url?.trim() || '';

  if (!title) {
    fieldErrors.title = 'Title is required.';
  } else if (title.length < 3 || title.length > 100) {
    fieldErrors.title = 'Title must be between 3 and 100 characters.';
  }

  if (!description) {
    fieldErrors.description = 'Description is required.';
  } else if (description.length < 10 || description.length > 1000) {
    fieldErrors.description = 'Description must be between 10 and 1000 characters.';
  }

  if (!input.category) {
    fieldErrors.category = 'Category is required.';
  } else if (!categoryList.includes(input.category)) {
    fieldErrors.category = 'Category is invalid.';
  }

  if (!input.status) {
    fieldErrors.status = 'Status is required.';
  } else if (!allowedStatuses.includes(input.status)) {
    fieldErrors.status = 'Status is invalid.';
  }

  if (!Number.isFinite(input.latitude)) {
    fieldErrors.latitude = 'Latitude is required.';
  } else if (input.latitude < -90 || input.latitude > 90) {
    fieldErrors.latitude = 'Latitude must be between -90 and 90.';
  }

  if (!Number.isFinite(input.longitude)) {
    fieldErrors.longitude = 'Longitude is required.';
  } else if (input.longitude < -180 || input.longitude > 180) {
    fieldErrors.longitude = 'Longitude must be between -180 and 180.';
  }

  if (contactMethod && (contactMethod.length < 3 || contactMethod.length > 200)) {
    fieldErrors.contact_method = 'Contact method must be between 3 and 200 characters.';
  }

  if (photoUrl && (photoUrl.length < 10 || photoUrl.length > 500)) {
    fieldErrors.photo_url = 'Photo URL must be between 10 and 500 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please fix the highlighted fields and try again.',
        fieldErrors
      }
    };
  }

  return {
    ok: true,
    value: {
      title,
      description,
      category: input.category,
      status: input.status,
      latitude: input.latitude,
      longitude: input.longitude,
      location_accuracy: input.location_accuracy || 'approximate',
      contact_method: contactMethod || undefined,
      photo_url: photoUrl || undefined
    }
  };
}

function validateUpdateResourceStatusInput(input: UpdateResourceStatusInput):
  | { ok: true; value: UpdateResourceStatusInput }
  | { ok: false; error: ServiceError } {
  const fieldErrors: Record<string, string> = {};

  const id = input.id?.trim() || '';

  if (!id) {
    fieldErrors.id = 'Resource id is required.';
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    fieldErrors.id = 'Resource id must be a valid UUID.';
  }

  if (!input.status) {
    fieldErrors.status = 'Status is required.';
  } else if (!allowedStatuses.includes(input.status)) {
    fieldErrors.status = 'Status is invalid.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please fix the highlighted fields and try again.',
        fieldErrors
      }
    };
  }

  return {
    ok: true,
    value: {
      id,
      status: input.status
    }
  };
}

function mapDbResourceToApp(row: DbResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: dbToAppCategory[row.category],
    status: row.status,
    latitude: row.latitude,
    longitude: row.longitude,
    location_accuracy: row.location_accuracy,
    contact_method: row.contact_method || undefined,
    photo_url: row.photo_url || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at || undefined,
    device_id_hash: row.device_id_hash || undefined
  };
}
