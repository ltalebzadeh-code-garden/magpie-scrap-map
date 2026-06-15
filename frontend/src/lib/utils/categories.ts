import type { ResourceCategory } from '$lib/types';

export const categoryLabels: Record<ResourceCategory, string> = {
  scrap_metal: 'Scrap Metal',
  wood: 'Wood / Lumber',
  tools: 'Tools',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  containers: 'Containers / Storage',
  building_materials: 'Building Materials',
  fuel: 'Fuel / Energy',
  other: 'Other'
};

export const categoryList: ResourceCategory[] = [
  'scrap_metal',
  'wood',
  'tools',
  'electrical',
  'plumbing',
  'containers',
  'building_materials',
  'fuel',
  'other'
];
