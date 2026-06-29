'use client';

import { useEffect, useState } from 'react';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';

const keys = ['site_logo_url','hero_logo_url','footer_logo_url','fiti_logo_url','animated_logo_url'] as const;
type LogoDebug = { id?: string; key: string; mode: string; usedKey: string; url: string };

export function ThemeDebugPanel() {
  const { settings, loading, error } = useThemeSettings();
  const [enabled, setEnabled] = useState(false);
  const [logos, setLogos] = useState<Record<string, LogoDebug>>({});

  useEffect(() => { setEnabled(new URLSearchParams(window.location.search).get('debug') === 'theme'); }, []);
  useEffect(() => {
    function onLogo(event: Event) { const detail = (event as CustomEvent<LogoDebug>).detail; setLogos((current) => ({ ...current, [detail.id ?? detail.key]: detail })); }
    window.addEventListener('theme-logo-debug', onLogo as EventListener);
    return () => window.removeEventListener('theme-logo-debug', onLogo as EventListener);
  }, []);
  if (!enabled) return null;
  const animatedMode = settings.animated_logo_enabled && toSafeString(settings.animated_logo_url).trim() ? 'imagem real' : 'fallback';
  return <div className="fixed bottom-3 right-3 z-[9999] max-h-[70vh] w-[min(92vw,28rem)] overflow-auto rounded-2xl border border-sun/40 bg-black/90 p-4 text-xs text-white shadow-2xl"><b className="text-sun">Debug theme_settings</b><p>Supabase configurado: {isSupabaseConfigured ? 'sim' : 'não'}</p><p>theme_settings carregado: {!loading && !error ? 'sim' : 'não'}</p>{error && <p className="text-red-300">erro de leitura: {error}</p>}{keys.map((key) => <p key={key} className="break-all"><span className="text-sun">{key}</span>: {toSafeString(settings[key]) || 'vazio'}</p>)}<p>animated_logo_enabled: {settings.animated_logo_enabled ? 'true' : 'false'}</p><hr className="my-2 border-white/10" /><p className="font-bold text-sun">Render visual público</p>{Object.entries(logos).map(([id,item]) => <p key={id} className="break-all">{id}: {item.mode} · key usada: {item.usedKey || item.key || 'nenhuma'} · URL usada: {item.url || 'fallback'}</p>)}<p className="break-all">DynamicBackground: {animatedMode} · key usada: animated_logo_url · URL usada: {animatedMode === 'imagem real' ? toSafeString(settings.animated_logo_url) : 'fallback'}</p></div>;
}
