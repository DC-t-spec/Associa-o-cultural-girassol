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
  if (url.startsWith('/')) return url;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : '';
  } catch {
    return '';
  }
}

function findCmsLogo(settings: Record<string, unknown>, settingKey?: string, fallbackKeys: string[] = []) {
  const keys = [settingKey, ...fallbackKeys].filter(Boolean) as string[];

  for (const key of keys) {
    const url = safeLogoUrl(settings[key]);
    if (url) return { key, url };
  }

  return { key: '', url: '' };
}

export function ManagedLogo({
  settingKey,
  fallbackKeys = [],
  fallback,
  alt,
  className,
  imageClassName,
  width,
  height,
  children,
  debugLabel,
}: ManagedLogoProps) {
  const { settings } = useThemeSettings();
  const orderedFallbackKeys = useMemo(() => fallbackKeys, [fallbackKeys]);
  const cmsLogo = findCmsLogo(settings, settingKey, orderedFallbackKeys);
  const [failedUrl, setFailedUrl] = useState('');
  const hasCmsLogo = Boolean(cmsLogo.url) && failedUrl !== cmsLogo.url;
  const mode = hasCmsLogo ? 'cms' : 'fallback';

  useEffect(() => {
    setFailedUrl('');
  }, [cmsLogo.url]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('theme-logo-debug', {
        detail: {
          id: debugLabel ?? settingKey ?? 'managed-logo',
          key: settingKey ?? '',
          mode,
          usedKey: hasCmsLogo ? cmsLogo.key : '',
          url: hasCmsLogo ? cmsLogo.url : '',
        },
      }),
    );
  }, [cmsLogo.key, cmsLogo.url, debugLabel, hasCmsLogo, mode, settingKey]);

  if (!hasCmsLogo) {
    return (
      <span className={cn('inline-flex items-center', className)} data-logo-key={settingKey ?? ''} data-logo-url="" data-logo-mode="fallback">
        {fallback ?? children}
      </span>
    );
  }

  return (
    <img
      src={cmsLogo.url}
      alt={alt}
      width={width}
      height={height}
      className={cn(className, 'object-contain', imageClassName)}
      data-logo-key={cmsLogo.key}
      data-logo-url={cmsLogo.url}
      data-logo-mode="cms"
      onError={() => setFailedUrl(cmsLogo.url)}
    />
  );
}
