'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AdminLogoLinkProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  ariaLabel?: string;
};

export function AdminLogoLink({ children, href = '/#inicio', className, ariaLabel = 'Ir para o início' }: AdminLogoLinkProps) {
  const router = useRouter();
  const lastTouchRef = useRef(0);

  function openAdmin() {
    router.push('/admin');
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLAnchorElement>) {
    const now = Date.now();
    if (now - lastTouchRef.current < 420) {
      event.preventDefault();
      openAdmin();
    }
    lastTouchRef.current = now;
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={className}
      onDoubleClick={(event) => {
        event.preventDefault();
        openAdmin();
      }}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Link>
  );
}
