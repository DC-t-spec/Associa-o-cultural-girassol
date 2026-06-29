'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { cn, isNonEmptyString, toSafeString } from '@/lib/utils';

type ManagedLogoProps = {
  settingKey?: string | string[];
  fallback?: ReactNode;
  src?: unknown;
  alt: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  children?: ReactNode;
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

export function ManagedLogo({ settingKey, fallback, src, alt, className, imageClassName, width, height, children }: ManagedLogoProps) {
  const { settings } = useThemeSettings();
  const keys = useMemo(() => (Array.isArray(settingKey) ? settingKey : settingKey ? [settingKey] : []), [settingKey]);
  const resolvedSrc = keys.map((key) => settings[key]).find((value) => safeLogoUrl(value)) ?? src;
  const url = safeLogoUrl(resolvedSrc);
  const [failedUrl, setFailedUrl] = useState('');

  useEffect(() => {
    setFailedUrl('');
  }, [url]);

  if (!url || failedUrl === url) return <>{fallback ?? children}</>;

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img src={url} alt={alt} width={width} height={height} className={cn('max-h-24 w-auto object-contain', imageClassName)} onError={() => setFailedUrl(url)} />
    </span>
  );
}
