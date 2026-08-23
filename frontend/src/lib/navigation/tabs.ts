export type TabId = 'map' | 'list' | 'add' | 'guide';

export const defaultTab: TabId = 'map';

export const tabRoutes: Record<TabId, string> = {
  map: '/app',
  list: '/list',
  add: '/add',
  guide: '/guide'
};

export const tabItems: { id: TabId; path: string; label: string }[] = [
  { id: 'map', path: tabRoutes.map, label: 'نقشه' },
  { id: 'list', path: tabRoutes.list, label: 'فهرست' },
  { id: 'add', path: tabRoutes.add, label: 'افزودن' },
  { id: 'guide', path: tabRoutes.guide, label: 'راهنما' }
];

export function isTabId(value: string | null | undefined): value is TabId {
  return value != null && value in tabRoutes;
}

export function resolveTab(value: string | null | undefined): TabId {
  return isTabId(value) ? value : defaultTab;
}

export const mapTabHref = `${tabRoutes.map}?tab=${defaultTab}`;
