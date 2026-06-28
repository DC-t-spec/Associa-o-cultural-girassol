'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type ManagedLogoProps = {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  children: React.ReactNode;
};

export function ManagedLogo({ src, alt, className, imageClassName, children }: ManagedLogoProps) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim();

  if (!url || failed) return <>{children}</>;

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img src={url} alt={alt} className={cn('max-h-24 w-auto object-contain', imageClassName)} onError={() => setFailed(true)} />
    </span>
  );
}
