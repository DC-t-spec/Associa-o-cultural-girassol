'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cmsFallbackFields } from '@/lib/data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { SectionField } from '@/types/cms';
import { toSafeString } from '@/lib/utils';
import type { PublicHookResult } from './usePublicRows';

const aliases: Record<string, string[]> = {
  primary_button_text: ['primary_button_label'], primary_button_link: ['primary_button_url'],
  secondary_button_text: ['secondary_button_label'], secondary_button_link: ['secondary_button_url'],
  section_title: ['title'], section_text: ['text', 'description'],
};

function usableJson(value: unknown) {
  return value !== null && value !== undefined && !(typeof value === 'object' && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0);
}

export function resolvePublicFieldValue(field: SectionField) {
  if (field.field_value !== null && field.field_value !== undefined && toSafeString(field.field_value).trim() !== '') return field.field_value;
  if (usableJson(field.field_json)) return typeof field.field_json === 'string' ? field.field_json : JSON.stringify(field.field_json);
  return '';
}

export function publicFieldMap(fields: SectionField[]) {
  const map: Record<string, unknown> = {};
  for (const field of fields) {
    const value = resolvePublicFieldValue(field);
    map[field.field_key] = value;
    for (const [canonical, names] of Object.entries(aliases)) {
      if (field.field_key === canonical) names.forEach((name) => { map[name] ??= value; });
      if (names.includes(field.field_key)) map[canonical] ??= value;
    }
  }
  return map;
}

export function usePublicSection(sectionKey: string, fallbackFields: SectionField[] = cmsFallbackFields[sectionKey] ?? []): PublicHookResult<Record<string, unknown>> {
  const fallbackRef = useRef(fallbackFields);
  fallbackRef.current = fallbackFields;
  const [fields, setFields] = useState<SectionField[]>(fallbackFields);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') {
      setFields(fallbackRef.current); setLoading(false); setError(isSupabaseConfigured ? null : 'Supabase não configurado.');
      return publicFieldMap(fallbackRef.current);
    }
    setLoading(true);
    const section = await supabase.from('page_sections').select('id').eq('section_key', sectionKey).eq('is_active', true).maybeSingle();
    if (section.error || !section.data?.id) {
      setLoading(false); setError(section.error?.message ?? null); setFields(fallbackRef.current);
      return publicFieldMap(fallbackRef.current);
    }
    const result = await supabase.from('section_fields').select('*').eq('section_id', section.data.id).order('order_index');
    setLoading(false);
    if (result.error) { setError(result.error.message); setFields(fallbackRef.current); return publicFieldMap(fallbackRef.current); }
    const next = ((result.data ?? []) as SectionField[]).length ? (result.data as SectionField[]) : fallbackRef.current;
    setError(null); setFields(next); return publicFieldMap(next);
  }, [sectionKey]);

  useEffect(() => { void refresh(); }, [refresh]);
  const data = useMemo(() => publicFieldMap(fields), [fields]);
  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);
}
