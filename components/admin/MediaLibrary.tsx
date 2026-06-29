'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { toSafeString } from '@/lib/utils';
import type { MediaAsset } from '@/types/cms';

const BUCKET = 'site-media';
const bucketWarning = 'Crie o bucket site-media no Supabase Storage e marque como público.';
const unavailable = 'Media Library indisponível. Configure o Supabase para carregar ficheiros.';
const categories = ['logos', 'gallery', 'partners', 'fiti', 'news', 'documents', 'videos'] as const;
type MediaCategory = (typeof categories)[number];

type Props = { selectable?: boolean; onSelect?: (asset: MediaAsset) => void; compact?: boolean };
type FormState = { title: string; description: string; altText: string; category: MediaCategory };

function getFileType(file: File): MediaAsset['file_type'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  return 'file';
}

function folderFor(category: MediaCategory, file: File) {
  const fileType = getFileType(file);
  if (fileType === 'video') return 'videos';
  if (fileType === 'pdf') return 'documents';
  return category;
}

function safeFileName(name: string) {
  const parts = name.split('.');
  const extension = parts.length > 1 ? `.${parts.pop()}` : '';
  const base = parts.join('.').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return `${base || 'ficheiro'}${extension.toLowerCase()}`;
}

function Preview({ asset }: { asset: MediaAsset }) {
  if (asset.file_type === 'image') return <img src={asset.file_url} alt={asset.alt_text || asset.title} className="h-24 w-full rounded-2xl object-cover" />;
  if (asset.file_type === 'video') return <video src={asset.file_url} className="h-24 w-full rounded-2xl object-cover" muted controls />;
  return <div className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-sm font-bold uppercase text-sun">{asset.file_type === 'pdf' ? 'PDF' : 'Ficheiro'}</div>;
}

export function MediaLibrary({ selectable = false, onSelect, compact = false }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<FormState>({ title: '', description: '', altText: '', category: 'logos' });

  const canUseSupabase = isSupabaseConfigured && Boolean(supabase);
  const acceptedTypes = useMemo(() => 'image/*,video/*,application/pdf', []);

  async function loadAssets() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setMessage(error.message.includes('relation') ? 'Execute supabase/schema.sql para criar a tabela media_assets.' : error.message);
      return;
    }
    setAssets(data ?? []);
  }

  useEffect(() => {
    if (canUseSupabase) void loadAssets();
  }, [canUseSupabase]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !form.title) setForm((current) => ({ ...current, title: selected.name.replace(/\.[^/.]+$/, '') }));
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return setMessage(unavailable);
    if (!file) return setMessage('Seleccione um ficheiro para carregar.');
    setUploading(true);
    setMessage('');

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setUploading(false);
      return setMessage('Inicie sessão no CMS para carregar ficheiros.');
    }

    const folder = folderFor(form.category, file);
    const storagePath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const upload = await supabase.storage.from(BUCKET).upload(storagePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (upload.error) {
      setUploading(false);
      return setMessage(upload.error.message.toLowerCase().includes('bucket') ? bucketWarning : upload.error.message);
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const asset = {
      title: toSafeString(form.title).trim() || file.name,
      description: toSafeString(form.description).trim(),
      file_url: publicData.publicUrl,
      file_type: getFileType(file),
      mime_type: file.type,
      alt_text: toSafeString(form.altText).trim(),
      storage_path: storagePath,
    };
    const insert = await supabase.from('media_assets').insert(asset).select('*').single();
    setUploading(false);
    if (insert.error) return setMessage(insert.error.message);
    setAssets((current) => [insert.data as MediaAsset, ...current]);
    setForm({ title: '', description: '', altText: '', category: form.category });
    setFile(null);
    setMessage('Ficheiro carregado e URL público gerado.');
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage('URL público copiado.');
  }

  async function deleteAsset(asset: MediaAsset) {
    if (!supabase || !confirm(`Apagar ${asset.title}?`)) return;
    const { error } = await supabase.from('media_assets').delete().eq('id', asset.id);
    if (error) return setMessage(error.message);
    if (asset.storage_path) await supabase.storage.from(BUCKET).remove([asset.storage_path]);
    setAssets((current) => current.filter((item) => item.id !== asset.id));
    setMessage('Ficheiro apagado.');
  }

  if (!canUseSupabase) return <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">{unavailable}</div>;

  return <div className="space-y-5">
    {!compact && <form onSubmit={handleUpload} className="grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 md:grid-cols-2">
      <label className="text-sm font-semibold text-zinc-200">Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-sun" required /></label>
      <label className="text-sm font-semibold text-zinc-200">Categoria<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MediaCategory })} className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-sun">{categories.map((category) => <option key={category} value={category}>{category}/</option>)}</select></label>
      <label className="text-sm font-semibold text-zinc-200">Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-sun" /></label>
      <label className="text-sm font-semibold text-zinc-200">Texto alternativo<textarea value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-sun" /></label>
      <label className="md:col-span-2 text-sm font-semibold text-zinc-200">Ficheiro<input type="file" accept={acceptedTypes} onChange={handleFileChange} className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-sun file:px-4 file:py-2 file:font-bold file:text-black" required /></label>
      <button disabled={uploading} className="rounded-full bg-sun px-5 py-3 font-bold text-black disabled:opacity-60">{uploading ? 'A carregar...' : 'Carregar'}</button>
    </form>}

    {message && <p className="rounded-2xl border border-sun/20 bg-sun/10 p-3 text-sm text-sun">{message}</p>}
    {loading ? <p className="text-zinc-400">A carregar ficheiros...</p> : assets.length === 0 ? <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-zinc-400">Ainda não há ficheiros carregados.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{assets.map((asset) => <article key={asset.id} className="rounded-3xl border border-white/10 bg-black/30 p-4">
      <Preview asset={asset} />
      <h3 className="mt-3 font-bold text-white">{asset.title}</h3>
      <p className="text-xs uppercase tracking-[.2em] text-sun">{asset.file_type}</p>
      <input readOnly value={asset.file_url} className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => copyUrl(asset.file_url)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white"><Copy size={14} /> Copiar URL</button>
        {selectable && <button type="button" onClick={() => onSelect?.(asset)} className="rounded-full bg-sun px-3 py-2 text-xs font-bold text-black">Seleccionar</button>}
        <button type="button" onClick={() => deleteAsset(asset)} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-3 py-2 text-xs font-bold text-red-100"><Trash2 size={14} /> Apagar</button>
      </div>
    </article>)}</div>}
  </div>;
}
