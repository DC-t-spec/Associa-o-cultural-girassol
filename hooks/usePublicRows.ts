'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';

type Row = Record<string, any>;
type QueryBuilder = (query: any) => any;

export type PublicHookResult<T> = { data: T; loading: boolean; error: string | null; refresh: () => Promise<T> };

export function dedupePublicRows<T extends Row>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${toSafeString(row.label || row.name || row.title).trim().toLowerCase()}|${toSafeString(row.url || row.link || row.slug).trim().toLowerCase()}`;
    if (!key.replace('|', '')) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function usePublicRows<T extends Row>(table: string, fallback: T[] = [], query?: QueryBuilder): PublicHookResult<T[]> {
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const queryRef = useRef(query);
  queryRef.current = query;
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') {
      setData(fallbackRef.current);
      setLoading(false);
      setError(isSupabaseConfigured ? null : 'Supabase não configurado.');
      return fallbackRef.current;
    }
    setLoading(true);
    const base = supabase.from(table).select('*');
    const result = await (queryRef.current ? queryRef.current(base) : base);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      setData(fallbackRef.current);
      return fallbackRef.current;
    }
    const rows = dedupePublicRows((result.data ?? []) as T[]);
    const next = rows.length ? rows : fallbackRef.current;
    setError(null);
    setData(next);
    return next;
  }, [table]);

  useEffect(() => { void refresh(); }, [refresh]);
  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);
}
