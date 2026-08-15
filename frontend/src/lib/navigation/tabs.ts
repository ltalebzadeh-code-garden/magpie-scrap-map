export type TabId = 'map' | 'list' | 'add' | 'offline';

export const defaultTab: TabId = 'map';

export const tabRoutes: Record<TabId, string> = {
  map: '/app',
  list: '/list',
  add: '/add',
  offline: '/offline'
};

export const tabItems: { id: TabId; path: string; label: string }[] = [
  { id: 'map', path: tabRoutes.map, label: 'نقشه' },
  { id: 'list', path: tabRoutes.list, label: 'فهرست' },
  { id: 'add', path: tabRoutes.add, label: 'افزودن' },
  { id: 'offline', path: tabRoutes.offline, label: 'آفلاین' }
];

export function isTabId(value: string | null | undefined): value is TabId {
  return value != null && value in tabRoutes;
}

export function resolveTab(value: string | null | undefined): TabId {
  return isTabId(value) ? value : defaultTab;
}

export const mapTabHref = `${tabRoutes.map}?tab=${defaultTab}`;
