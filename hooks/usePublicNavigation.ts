'use client';

import { cmsFallbackNavigation } from '@/lib/data';
import type { NavigationItem } from '@/types/cms';
import { usePublicRows } from './usePublicRows';

export function usePublicNavigation(location: NavigationItem['location']) {
  const fallback = cmsFallbackNavigation.filter((item) => item.location === location && item.is_active).sort((a, b) => a.order_index - b.order_index);
  return usePublicRows<NavigationItem>('navigation_items', fallback, (q) => q.eq('location', location).eq('is_active', true).order('order_index'));
}
