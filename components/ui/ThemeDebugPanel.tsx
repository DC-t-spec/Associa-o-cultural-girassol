'use client';

import { useEffect, useState } from 'react';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';

const keys = ['site_logo_url','hero_logo_url','footer_logo_url','fiti_logo_url','animated_logo_url'] as const;
type LogoDebug = { key: string; mode: string; usedKey: string; url: string };

export function ThemeDebugPanel() {
  const { settings, loading, error } = useThemeSettings();
  const [enabled, setEnabled] = useState(false);
  const [logos, setLogos] = useState<Record<string, LogoDebug>>({});

  useEffect(() => { setEnabled(new URLSearchParams(window.location.search).get('debug') === 'theme'); }, []);
  useEffect(() => {
    function onLogo(event: Event) { const detail = (event as CustomEvent<LogoDebug>).detail; setLogos((current) => ({ ...current, [detail.key]: detail })); }
    window.addEventListener('theme-logo-debug', onLogo as EventListener);
    return () => window.removeEventListener('theme-logo-debug', onLogo as EventListener);
  }, []);
  if (!enabled) return null;
  return <div className="fixed bottom-3 right-3 z-[9999] max-h-[70vh] w-[min(92vw,28rem)] overflow-auto rounded-2xl border border-sun/40 bg-black/90 p-4 text-xs text-white shadow-2xl"><b className="text-sun">Debug theme_settings</b><p>Supabase configurado: {isSupabaseConfigured ? 'sim' : 'não'}</p><p>theme_settings carregado: {!loading && !error ? 'sim' : 'não'}</p>{error && <p className="text-red-300">erro de leitura: {error}</p>}{keys.map((key) => <p key={key} className="break-all"><span className="text-sun">{key}</span>: {toSafeString(settings[key]) || 'vazio'}</p>)}<hr className="my-2 border-white/10" />{Object.values(logos).map((item) => <p key={item.key} className="break-all">{item.key}: {item.mode} · key usada: {item.usedKey || 'nenhuma'} · URL: {item.url || 'fallback'}</p>)}</div>;
}
