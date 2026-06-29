'use client';

import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';

const logoKeys = ['site_logo_url','hero_logo_url','footer_logo_url','fiti_logo_url','animated_logo_url'] as const;
type Check = { label: string; ok: boolean | null; detail: string };
type CmsBackupRow = { field_key: string; field_value: string | null; field_json?: unknown };

function status(ok: boolean | null) { return ok === null ? '—' : ok ? 'sim' : 'não'; }
function errorMessage(error: unknown) { return error instanceof Error ? error.message : toSafeString(error) || 'Erro desconhecido.'; }

export function SupabaseDiagnostics() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cmsBackup, setCmsBackup] = useState<CmsBackupRow[] | null>(null);

  function push(message: string) { setLog((current) => [message, ...current].slice(0, 12)); }
  function setCheck(label: string, ok: boolean | null, detail: string) { setChecks((current) => [...current.filter((item) => item.label !== label), { label, ok, detail }]); }

  async function testConnection() {
    setLoading(true);
    setChecks([]);
    try {
      setCheck('Supabase configurado?', isSupabaseConfigured && Boolean(supabase), isSupabaseConfigured ? 'Cliente público criado com anon key.' : 'NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente/inválido.');
      setCheck('URL Supabase presente?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), process.env.NEXT_PUBLIC_SUPABASE_URL ? 'URL pública encontrada no build.' : 'NEXT_PUBLIC_SUPABASE_URL está vazio.');
      setCheck('Anon key presente?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Anon key pública encontrada no build.' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY está vazia.');
      if (!supabase) return;
      const sessionResult = await supabase.auth.getSession();
      const user = sessionResult.data.session?.user;
      setCheck('Utilizador autenticado?', Boolean(user), user?.email ?? 'Sem sessão Supabase.');
      const admin = user ? await supabase.from('admin_profiles').select('id,role,email').eq('id', user.id).maybeSingle() : { data: null, error: null };
      setCheck('Admin reconhecido?', Boolean(admin.data && !admin.error), admin.error ? `Erro ao confirmar admin: ${admin.error.message}` : admin.data ? 'Perfil admin encontrado.' : 'Utilizador sem registo em admin_profiles.');
      await testThemeRead();
      const media = await supabase.from('media_assets').select('id,file_url').limit(1);
      setCheck('Consegue ler media_assets?', !media.error, media.error ? `Erro ao ler media_assets: ${media.error.message}` : `${media.data?.length ?? 0} registo(s) lido(s).`);
      const publicUrl = supabase.storage.from('site-media').getPublicUrl('diagnostico-public-url.txt');
      setCheck('Consegue ler public URL de imagem?', Boolean(publicUrl.data.publicUrl), publicUrl.data.publicUrl || 'Não foi possível gerar URL público do bucket site-media.');
      push('Teste de ligação Supabase concluído.');
    } catch (error) { push(`Erro no diagnóstico: ${errorMessage(error)}`); }
    finally { setLoading(false); }
  }

  async function testThemeRead() {
    if (!supabase) { push('Erro ao ler theme_settings: Supabase não configurado.'); return {}; }
    const { data, error } = await supabase.from('theme_settings').select('key,value,updated_at').in('key', logoKeys as unknown as string[]);
    if (error) { setCheck('Consegue ler theme_settings?', false, `Erro ao ler theme_settings: ${error.message}`); push(`Erro ao ler theme_settings: ${error.message}`); return {}; }
    const next = Object.fromEntries((data ?? []).map((row) => [row.key, toSafeString(row.value)]));
    setValues(next);
    setCheck('Consegue ler theme_settings?', true, `${data?.length ?? 0} valor(es) de logotipo lido(s).`);
    logoKeys.forEach((key) => { if (!next[key]) push(`${key} está vazio.`); });
    return next;
  }

  async function testThemeWrite() {
    if (!supabase) return push('Erro ao gravar theme_settings: Supabase não configurado.');
    setLoading(true);
    const key = 'diagnostics_last_test_at';
    const { error } = await supabase.from('theme_settings').upsert({ key, value: new Date().toISOString() }, { onConflict: 'key' });
    setCheck('Consegue escrever em theme_settings?', !error, error ? `Erro ao gravar theme_settings: ${error.message}` : 'Upsert de diagnóstico concluído com a sessão actual.');
    push(error ? `Erro ao gravar theme_settings: ${error.message}` : 'Gravação theme_settings OK.');
    setLoading(false);
  }

  async function testStorageUpload() {
    if (!supabase) return push('Erro no upload: Supabase não configurado.');
    setLoading(true);
    const path = `diagnostics/${Date.now()}-${crypto.randomUUID()}.png`;
    const pngBytes = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,120,156,99,248,255,255,255,127,0,9,251,3,253,5,67,69,202,0,0,0,0,73,69,78,68,174,66,96,130]);
    const upload = await supabase.storage.from('site-media').upload(path, new Blob([pngBytes], { type: 'image/png' }), { upsert: false, contentType: 'image/png' });
    setCheck('Consegue fazer upload no bucket site-media?', !upload.error, upload.error ? `Erro ao fazer upload site-media: ${upload.error.message}` : `Upload OK: ${path}`);
    if (!upload.error) await supabase.storage.from('site-media').remove([path]);
    push(upload.error ? `Erro ao fazer upload site-media: ${upload.error.message}` : 'Upload site-media OK.');
    setLoading(false);
  }


  async function createCmsSyncTest() {
    if (!supabase) return push('Erro no teste CMS: Supabase não configurado.');
    setLoading(true);
    const section = await supabase.from('page_sections').select('id,page_slug,section_key').eq('page_slug', 'home').eq('section_key', 'home_hero').maybeSingle();
    if (section.error || !section.data?.id) { push(`Erro: não encontrei page_sections.home_hero (${section.error?.message || 'sem id'}).`); setLoading(false); return; }
    const current = await supabase.from('section_fields').select('field_key,field_value,field_json').eq('section_id', section.data.id).in('field_key', ['title', 'subtitle']);
    if (current.error) { push(`Erro ao ler valores actuais do hero: ${current.error.message}`); setLoading(false); return; }
    setCmsBackup((current.data ?? []) as CmsBackupRow[]);
    const updates = [
      { section_id: section.data.id, field_key: 'title', field_label: 'Título', field_type: 'text', field_value: 'TESTE CMS HERO 123', field_json: {}, order_index: 1 },
      { section_id: section.data.id, field_key: 'subtitle', field_label: 'Subtítulo', field_type: 'text', field_value: 'TESTE CMS SUBTITLE 123', field_json: {}, order_index: 2 },
    ];
    const write = await supabase.from('section_fields').upsert(updates, { onConflict: 'section_id,field_key' });
    if (write.error) push(`Erro ao gravar teste CMS em section_fields: ${write.error.message}`);
    const verify = await supabase.from('section_fields').select('section_id,field_key,field_value,updated_at').eq('section_id', section.data.id).in('field_key', ['title', 'subtitle']).order('field_key');
    const ok = !write.error && !verify.error && (verify.data ?? []).some((row) => row.field_key === 'title' && row.field_value === 'TESTE CMS HERO 123') && (verify.data ?? []).some((row) => row.field_key === 'subtitle' && row.field_value === 'TESTE CMS SUBTITLE 123');
    if (verify.error) push(`Erro na confirmação por select: ${verify.error.message}`);
    (verify.data ?? []).forEach((row) => push(`Confirmado: section_id=${row.section_id} · field_key=${row.field_key} · valor=${row.field_value} · updated_at=${row.updated_at}`));
    push(ok ? 'Confirmado por select: home_hero.title e home_hero.subtitle foram salvos em public.section_fields.' : 'Falha na confirmação por select: valores esperados não encontrados.');
    push('Agora abra a homepage e faça Ctrl+F5. Os textos devem aparecer sem novo redeploy se a página estiver a consumir o CMS em runtime.');
    setLoading(false);
  }

  async function revertCmsSyncTest() {
    if (!supabase) return push('Erro ao reverter: Supabase não configurado.');
    setLoading(true);
    const section = await supabase.from('page_sections').select('id,page_slug,section_key').eq('page_slug', 'home').eq('section_key', 'home_hero').maybeSingle();
    if (section.error || !section.data?.id || !cmsBackup?.length) { push('Não há backup do teste CMS para reverter nesta sessão.'); setLoading(false); return; }
    const rows = cmsBackup;
    for (const row of rows) {
      const result = await supabase.from('section_fields').upsert({ section_id: section.data.id, field_key: row.field_key, field_label: row.field_key, field_type: 'text', field_value: row.field_value ?? '', field_json: row.field_json ?? {}, order_index: row.field_key === 'title' ? 1 : 2 }, { onConflict: 'section_id,field_key' });
      if (result.error) push(`Erro ao reverter ${row.field_key}: ${result.error.message}`);
    }
    push('Teste CMS revertido para os valores anteriores guardados no diagnóstico.');
    setLoading(false);
  }

  async function testPublicLogos() {
    const current = await testThemeRead();
    logoKeys.forEach((key) => push(current[key] ? `${key} lido pelo site público como key oficial.` : `${key} está vazio.`));
    push('Se o debug público mostrar outra key, o site está a ler a key errada.');
  }

  return <section id="Diagnóstico" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5"><h2 className="font-display text-3xl text-sun">Diagnóstico</h2><p className="mt-2 text-zinc-300">Testes reais CMS → theme_settings → media_assets → Storage. Os erros abaixo são mensagens devolvidas pelo Supabase.</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={loading} onClick={testConnection} className="rounded-full bg-sun px-4 py-2 font-bold text-black">Testar ligação Supabase</button><button onClick={testThemeRead} className="rounded-full border border-white/10 px-4 py-2">Testar leitura theme_settings</button><button onClick={testThemeWrite} className="rounded-full border border-white/10 px-4 py-2">Testar gravação theme_settings</button><button onClick={testThemeRead} className="rounded-full border border-white/10 px-4 py-2">Recarregar valores</button><button onClick={testPublicLogos} className="rounded-full border border-white/10 px-4 py-2">Testar leitura pública dos logotipos</button><button onClick={testStorageUpload} className="rounded-full border border-white/10 px-4 py-2">Testar upload site-media</button><button onClick={createCmsSyncTest} className="rounded-full bg-emerald-400 px-4 py-2 font-bold text-black">Criar teste de sincronização CMS</button><button onClick={revertCmsSyncTest} className="rounded-full border border-red-300/40 px-4 py-2 text-red-200">Reverter teste CMS</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="space-y-2">{checks.map((check) => <div key={check.label} className="rounded-2xl border border-white/10 bg-black/30 p-3"><b className="text-white">{check.label} {status(check.ok)}</b><p className="text-sm text-zinc-400">{check.detail}</p></div>)}</div><div className="rounded-2xl border border-white/10 bg-black/30 p-3"><h3 className="font-bold text-white">Últimos valores guardados</h3>{logoKeys.map((key) => <p key={key} className="mt-2 break-all text-sm"><span className="text-sun">{key}</span>: <span className="text-zinc-300">{values[key] || 'vazio'}</span></p>)}<h3 className="mt-5 font-bold text-white">Erros e notas</h3>{log.length ? log.map((item, index) => <p key={`${item}-${index}`} className="mt-2 text-sm text-zinc-300">{item}</p>) : <p className="mt-2 text-sm text-zinc-500">Sem testes executados.</p>}</div></div></section>;
}
