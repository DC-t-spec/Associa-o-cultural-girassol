'use client';

import { ManagedLogo } from '@/components/ui/ManagedLogo';
import { GirassolLogo } from '@/components/ui/GirassolLogo';
import { FitiLogo } from '@/components/ui/FitiLogo';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';

const logoKeys = ['site_logo_url', 'fiti_logo_url', 'animated_logo_url'] as const;

function DirectImage({ label, url }: { label: string; url: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h2 className="mb-3 font-bold text-sun">{label}</h2>
      {url ? <img src={url} alt={label} className="max-h-40 w-auto object-contain" data-direct-logo-url={url} /> : <p className="text-zinc-400">URL vazia</p>}
    </div>
  );
}

export function LogoTestClient() {
  const { settings, loading, error } = useThemeSettings();
  const values = Object.fromEntries(logoKeys.map((key) => [key, toSafeString(settings[key]).trim()])) as Record<(typeof logoKeys)[number], string>;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-display text-4xl font-black text-sun">Teste visual dos logotipos CMS</h1>
          <p className="mt-2 text-zinc-300">Rota pública estática: /logo-test/</p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-black/40 p-5 text-sm">
          <p>Supabase configurado: <b>{isSupabaseConfigured ? 'sim' : 'não'}</b></p>
          <p>theme_settings carregado: <b>{!loading && !error ? 'sim' : 'não'}</b></p>
          {error && <p className="text-red-300">Erro: {error}</p>}
          {logoKeys.map((key) => <p key={key} className="break-all"><span className="text-sun">{key}</span>: {values[key] || 'vazio'}</p>)}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <DirectImage label="Imagem directa site_logo_url" url={values.site_logo_url} />
          <DirectImage label="Imagem directa fiti_logo_url" url={values.fiti_logo_url} />
          <DirectImage label="Imagem directa animated_logo_url" url={values.animated_logo_url} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h2 className="mb-3 font-bold text-sun">ManagedLogo site_logo_url</h2>
            <ManagedLogo settingKey="site_logo_url" alt="Associação Cultural Girassol" className="h-24 w-auto object-contain" fallback={<GirassolLogo />} />
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h2 className="mb-3 font-bold text-sun">ManagedLogo fiti_logo_url</h2>
            <ManagedLogo settingKey="fiti_logo_url" alt="FITI – Festival Internacional Teatro de Inverno" className="h-24 w-auto object-contain" fallback={<FitiLogo />} />
          </div>
        </section>
      </div>
    </main>
  );
}
