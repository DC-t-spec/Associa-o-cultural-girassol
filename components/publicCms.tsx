'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cmsFallbackFields } from '@/lib/data';
import type { SectionField } from '@/types/cms';
import { toSafeString } from '@/lib/utils';

type Row = Record<string, any>;
const empty = 'Conteúdo em actualização. Em breve serão publicadas novas informações.';

function resolveFieldValue(field: SectionField) {
  if (field.field_value !== null && field.field_value !== undefined && String(field.field_value).trim() !== '') return field.field_value;
  if (field.field_json !== null && field.field_json !== undefined) return typeof field.field_json === 'string' ? field.field_json : JSON.stringify(field.field_json);
  return '';
}

const aliases: Record<string, string[]> = {
  primary_button_text: ['primary_button_label'],
  primary_button_link: ['primary_button_url'],
  secondary_button_text: ['secondary_button_label'],
  secondary_button_link: ['secondary_button_url'],
  section_title: ['title'],
  section_text: ['text', 'description'],
};

export function fieldMap(fields: SectionField[]) {
  const map: Record<string, unknown> = {};
  for (const field of fields) {
    const value = resolveFieldValue(field);
    map[field.field_key] = value;
    for (const [canonical, names] of Object.entries(aliases)) {
      if (field.field_key === canonical) names.forEach((name) => { map[name] ??= value; });
      if (names.includes(field.field_key)) map[canonical] ??= value;
    }
  }
  return map;
}

export function dedupeRows<T extends Row>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${toSafeString(row.label || row.name || row.title).trim().toLowerCase()}|${toSafeString(row.url || row.link || row.slug).trim().toLowerCase()}`;
    if (!key.replace('|', '') || seen.has(key)) return !seen.has(key) && (seen.add(key), true);
    seen.add(key);
    return true;
  });
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
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const [rows, setRows] = useState<T[]>(fallback);
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isSupabaseConfigured || !supabase) return;
      const base = supabase.from(table).select('*');
      const result = await (query ? query(base) : base);
      if (alive && !result.error) { const data = (result.data ?? []) as T[]; setRows(data.length ? dedupeRows(data) : fallbackRef.current); }
    }
    void load();
    return () => { alive = false; };
  }, [table, query]);
  return rows;
}

export function text(value: unknown, fallback = empty) { return toSafeString(value, fallback).trim() || fallback; }
export function bool(value: unknown, fallback = false) { if (typeof value === 'boolean') return value; const v = text(value, String(fallback)).toLowerCase(); return ['true','1','yes','sim'].includes(v); }
export function img(value: unknown) { const v = text(value, ''); return v.startsWith('http') || v.startsWith('/') ? v : ''; }
