'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cmsFallbackFields } from '@/lib/data';
import type { SectionField } from '@/types/cms';
import { toSafeString } from '@/lib/utils';

type Row = Record<string, any>;
const empty = 'Conteúdo em actualização. Em breve serão publicadas novas informações.';

export function fieldMap(fields: SectionField[]) {
  return Object.fromEntries(fields.map((f) => [f.field_key, f.field_value]));
}

export function useSection(sectionKey: string) {
  const [fields, setFields] = useState<SectionField[]>(cmsFallbackFields[sectionKey] ?? []);
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isSupabaseConfigured || !supabase) return;
      const section = await supabase.from('page_sections').select('id').eq('section_key', sectionKey).eq('is_active', true).maybeSingle();
      if (!alive || !section.data?.id) return;
      const result = await supabase.from('section_fields').select('*').eq('section_id', section.data.id).order('order_index');
      if (alive && !result.error && result.data?.length) setFields(result.data as SectionField[]);
    }
    void load();
    return () => { alive = false; };
  }, [sectionKey]);
  return useMemo(() => fieldMap(fields), [fields]);
}

export function useRows<T extends Row>(table: string, fallback: T[], query?: (q: any) => any) {
  const [rows, setRows] = useState<T[]>(fallback);
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isSupabaseConfigured || !supabase) return;
      const base = supabase.from(table).select('*');
      const result = await (query ? query(base) : base);
      if (alive && !result.error) setRows(((result.data ?? []) as T[]));
    }
    void load();
    return () => { alive = false; };
  }, [table, query]);
  return rows;
}

export function text(value: unknown, fallback = empty) { return toSafeString(value, fallback).trim() || fallback; }
export function bool(value: unknown, fallback = false) { if (typeof value === 'boolean') return value; const v = text(value, String(fallback)).toLowerCase(); return ['true','1','yes','sim'].includes(v); }
export function img(value: unknown) { const v = text(value, ''); return v.startsWith('http') || v.startsWith('/') ? v : ''; }
