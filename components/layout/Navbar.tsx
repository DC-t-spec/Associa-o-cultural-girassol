'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GirassolLogo } from '@/components/ui/GirassolLogo';
import { ManagedLogo } from '@/components/ui/ManagedLogo';
import { MobileMenu } from './MobileMenu';
import type { ThemeSettings } from '@/types/cms';
import { usePublicNavigation } from '@/hooks/usePublicNavigation';

export function Navbar({ settings }: { settings?: ThemeSettings }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { data: links } = usePublicNavigation('main_menu');

  useEffect(() => {
    const update = () => setScrolled(scrollY > 30);
    update();
    addEventListener('scroll', update);
    return () => removeEventListener('scroll', update);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition ${scrolled ? 'bg-black/85 shadow-2xl backdrop-blur' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/#inicio"
          onDoubleClick={(event) => {
            event.preventDefault();
            router.push('/admin');
          }}
          className="flex items-center gap-3"
        >
          <ManagedLogo
            debugLabel="Navbar"
            settingKey="site_logo_url"
            alt={settings?.site_logo_alt || 'Associação Cultural Girassol'}
            className="h-14 w-auto object-contain"
            fallback={<GirassolLogo compact />}
          />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-zinc-200 md:flex">
          {links.map((link: any) => {
            const isFiti = String(link.url).replace(/\/$/, '') === '/fiti';
            return (
              <Link
                className={isFiti
                  ? 'rounded-full bg-sun px-6 py-3 font-black uppercase tracking-[0.18em] text-black shadow-[0_0_24px_rgba(255,190,0,0.45)] transition hover:scale-105 hover:bg-yellow-300'
                  : 'transition hover:text-sun'}
                key={link.id || link.url}
                href={link.url}
              >
                {isFiti ? `★ ${link.label}` : link.label}
              </Link>
            );
          })}
          {!links.some((link: any) => String(link.url).replace(/\/$/, '') === '/fiti') && (
            <Button href="/fiti" className="px-6 py-3 font-black uppercase tracking-[0.18em] shadow-[0_0_24px_rgba(255,190,0,0.45)]">
              ★ FITI
            </Button>
          )}
        </nav>

        <MobileMenu links={links.map((link: any) => ({ href: link.url, label: link.label }))} />
      </div>
    </header>
  );
}
