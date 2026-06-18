export type ResourceStatus = 'available' | 'claimed' | 'possibly_gone' | 'expired';

export type ResourceCategory =
  | 'scrap_metal'
  | 'wood'
  | 'tools'
  | 'electrical'
  | 'plumbing'
  | 'containers'
  | 'building_materials'
  | 'fuel'
  | 'other';

export type LocationAccuracy = 'exact' | 'approximate' | 'area_only';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  location_accuracy: LocationAccuracy;
  contact_method?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  device_id_hash?: string;
}

export interface ResourceSummary {
  id: string;
  title: string;
  category: ResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  created_at: string;
  distance?: number;
}

export interface CreateResourceInput {
  title: string;
  description: string;
  category: ResourceCategory;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  location_accuracy?: LocationAccuracy;
  contact_method?: string;
  photo_url?: string;
}

export interface UpdateResourceStatusInput {
  id: string;
  status: ResourceStatus;
}
