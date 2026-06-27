import type { ResourceCategory } from '$lib/types';

export const categoryLabels: Record<ResourceCategory, string> = {
  scrap_metal: 'فلز ضایعاتی',
  wood: 'چوب / الوار',
  tools: 'ابزار',
  electrical: 'برقی',
  plumbing: 'لوله‌کشی',
  containers: 'ظرف / انبار',
  building_materials: 'مصالح ساختمانی',
  fuel: 'سوخت / انرژی',
  other: 'سایر'
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
