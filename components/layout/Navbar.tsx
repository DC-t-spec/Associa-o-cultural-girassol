'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GirassolLogo } from '@/components/ui/GirassolLogo';
import { MobileMenu } from './MobileMenu';

const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#quem-somos', label: 'Quem Somos' },
  { href: '#historia', label: 'História' },
  { href: '#projectos', label: 'Projectos' },
  { href: '#impacto', label: 'Impacto' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#noticias', label: 'Notícias' },
  { href: '#parceiros', label: 'Parceiros' },
  { href: '#contacto', label: 'Contacto' },
];

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition ${
        scrolled ? 'bg-black/85 shadow-2xl backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/#inicio"
          aria-label="Ir para o início"
          className="flex items-center gap-3"
          onDoubleClick={(event) => {
            event.preventDefault();
            router.push('/admin');
          }}
        >
          <GirassolLogo compact className="p-1" />
          <span className="hidden font-display text-xl font-bold text-white sm:block">Girassol</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-zinc-200 md:flex">
          {links.map((link) => (
            <Link className="hover:text-sun" key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Button href="/fiti" className="px-5 py-2">
            FITI
          </Button>
        </nav>

        <MobileMenu links={[...links, { href: '/fiti', label: 'FITI' }]} />
      </div>
    </header>
  );
}
