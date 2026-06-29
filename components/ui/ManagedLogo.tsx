'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { cn, isNonEmptyString, toSafeString } from '@/lib/utils';

type ManagedLogoProps = {
  settingKey?: string;
  fallbackKeys?: string[];
  fallback?: ReactNode;
  src?: unknown;
  alt: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  children?: ReactNode;
  debugLabel?: string;
};

function safeLogoUrl(value: unknown) {
  const url = isNonEmptyString(value) ? toSafeString(value).trim() : '';
  if (!url) return '';

  try {
    if (url.startsWith('/')) return url;
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'data:' ? url : '';
  } catch {
    return '';
  }
}

function withCacheBust(url: string, updatedAt?: string) {
  if (!updatedAt || url.startsWith('data:') || url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('v', updatedAt);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function ManagedLogo({
  settingKey,
  fallbackKeys = [],
  fallback,
  src,
  alt,
  className,
  imageClassName,
  width,
  height,
  children,
  debugLabel,
}: ManagedLogoProps) {
  const { settings, updatedAtMap } = useThemeSettings();
  const keys = useMemo(() => [settingKey, ...fallbackKeys].filter(Boolean) as string[], [settingKey, fallbackKeys]);
  const usedKey = keys.find((key) => safeLogoUrl(settings[key]));
  const primaryUrl = settingKey ? safeLogoUrl(settings[settingKey]) : '';
  const fallbackUrl = fallbackKeys.map((key) => safeLogoUrl(settings[key])).find(Boolean) ?? '';
  const rawUrl = primaryUrl || fallbackUrl || safeLogoUrl(src);
  const url = withCacheBust(rawUrl, usedKey ? updatedAtMap[usedKey] : undefined);
  const [failedUrl, setFailedUrl] = useState('');

  useEffect(() => {
    setFailedUrl('');
  }, [url]);

  const mode = !url || failedUrl === url ? 'fallback' : 'imagem real';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('theme-logo-debug', {
        detail: {
          id: debugLabel ?? settingKey ?? 'direct-src',
          key: settingKey ?? 'direct-src',
          mode,
          usedKey: usedKey ?? '',
          url: mode === 'imagem real' ? url : '',
        },
      }),
    );
  }, [debugLabel, settingKey, mode, usedKey, url]);

  if (mode === 'fallback') return <span className={cn('inline-flex items-center', className)}>{fallback ?? children}</span>;

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img src={url} alt={alt} width={width} height={height} className={cn('max-h-24 w-auto object-contain', imageClassName)} onError={() => setFailedUrl(url)} />
    </span>
  );
}
