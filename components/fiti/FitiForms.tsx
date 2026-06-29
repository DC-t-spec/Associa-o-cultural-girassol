'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { supabase } from '@/lib/supabase';

type App = {
  type: string;
  company_name?: string;
  country?: string;
  city?: string;
  contact_person: string;
  email: string;
  phone?: string;
  show_title?: string;
  duration?: string;
  team_size?: string;
  video_link?: string;
  portfolio_link?: string;
  synopsis?: string;
  technical_needs?: string;
  notes?: string;
};

export function FitiForms() {
  const { register, handleSubmit, reset } = useForm<App>({ defaultValues: { type: 'company' } });
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  async function submit(data: App) {
    setError('');
    if (supabase) {
      const result = await supabase.from('fiti_applications').insert(data);
      if (result.error) { setError('Não foi possível registar o pedido. Tente novamente ou contacte a organização.'); return; }
    }

    setOk(true);
    reset();
  }

  return (
    <section id="formularios" className="py-24">
      <div className="mx-auto max-w-4xl px-4">
        <SectionTitle eyebrow="Formulários FITI" title="Inscrições e pedidos" />
        <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-900/70 p-6 md:grid-cols-2">
          <label className="block text-sm text-zinc-200">Tipo<select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white" {...register('type')}><option value="company">Inscrição de companhia</option><option value="volunteer">Voluntariado</option><option value="press">Credenciamento de imprensa</option><option value="info">Pedido de informações</option></select></label>
          <FormInput label="Nome da companhia" registration={register('company_name')} />
          <FormInput label="País" registration={register('country')} />
          <FormInput label="Cidade" registration={register('city')} />
          <FormInput label="Pessoa de contacto" registration={register('contact_person', { required: true })} />
          <FormInput label="Email" type="email" registration={register('email', { required: true })} />
          <FormInput label="Telefone/WhatsApp" registration={register('phone')} />
          <FormInput label="Nome do espectáculo" registration={register('show_title')} />
          <FormInput label="Duração" registration={register('duration')} />
          <FormInput label="Número de integrantes" registration={register('team_size')} />
          <FormInput label="Link de vídeo" registration={register('video_link')} />
          <FormInput label="Link de portfólio" registration={register('portfolio_link')} />
          <div className="md:col-span-2"><FormInput label="Sinopse" textarea registration={register('synopsis')} /></div>
          <div className="md:col-span-2"><FormInput label="Necessidades técnicas" textarea registration={register('technical_needs')} /></div>
          <div className="md:col-span-2"><FormInput label="Observações" textarea registration={register('notes')} /></div>
          {error && <p className="text-red-300 md:col-span-2">{error}</p>}
          {ok && <p className="text-sun md:col-span-2">Pedido registado com sucesso. Se necessário, confirme também por WhatsApp ou email.</p>}
          <Button type="submit" className="md:col-span-2">Enviar</Button>
        </form>
      </div>
    </section>
  );
}
