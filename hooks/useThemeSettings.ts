'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cmsFallbackTheme } from '@/lib/data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';

export type ClientThemeSettings = Record<string, unknown>;

type ThemeSettingRow = {
  key: unknown;
  value: unknown;
  value_json?: unknown;
  updated_at?: unknown;
};

const booleanKeys = new Set(['dominant_yellow_enabled', 'animated_background_enabled', 'animated_logo_enabled', 'particles_enabled', 'stage_lights_enabled']);
const numberKeys = new Set(['animated_logo_opacity', 'animated_logo_speed', 'overlay_opacity']);

function coerceSettingValue(row: ThemeSettingRow): unknown {
  const key = toSafeString(row.key).trim();
  const raw = row.value_json !== null && row.value_json !== undefined ? row.value_json : row.value;

  if (booleanKeys.has(key)) {
    if (typeof raw === 'boolean') return raw;
    const value = toSafeString(raw).trim().toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  }

  if (numberKeys.has(key)) {
    const value = Number(raw);
    return Number.isFinite(value) ? value : raw;
  }

  return raw;
}

function rowsToSettings(rows: ThemeSettingRow[] | null | undefined): ClientThemeSettings {
  const entries = (rows ?? [])
    .map((row) => [toSafeString(row.key).trim(), coerceSettingValue(row)] as const)
    .filter(([key]) => key.length > 0);

  return Object.fromEntries(entries);
}

export function useThemeSettings(initialSettings?: ClientThemeSettings) {
  const fallbackSettings = useMemo(() => ({ ...cmsFallbackTheme, ...(initialSettings ?? {}) }), [initialSettings]);
  const [settings, setSettings] = useState<ClientThemeSettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAtMap, setUpdatedAtMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setSettings(fallbackSettings);
  }, [fallbackSettings]);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') {
      setSettings(fallbackSettings);
      setUpdatedAtMap({});
      setError(isSupabaseConfigured ? null : 'Supabase não configurado.');
      setLoading(false);
      return fallbackSettings;
    }

    setLoading(true);
    const { data, error } = await supabase.from('theme_settings').select('key,value,value_json,updated_at');
    setLoading(false);

    if (error) {
      setError(error.message);
      setSettings(fallbackSettings);
      setUpdatedAtMap({});
      return fallbackSettings;
    }

    const rows = data as ThemeSettingRow[];
    const nextSettings = { ...fallbackSettings, ...rowsToSettings(rows) };
    setError(null);
    setUpdatedAtMap(Object.fromEntries((rows ?? []).map((row) => [toSafeString(row.key).trim(), toSafeString(row.updated_at).trim()]).filter(([key]) => key.length > 0)));
    setSettings(nextSettings);
    return nextSettings;
  }, [fallbackSettings]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { settings, loading, error, refresh, updatedAtMap };
}
