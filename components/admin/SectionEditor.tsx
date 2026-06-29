'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PageSection, SectionField } from '@/types/cms';
import { supabase } from '@/lib/supabase';
import { EditableField } from './EditableField';

type SaveArgs = {
  sectionId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: SectionField['field_type'];
  value?: string;
  jsonValue?: SectionField['field_json'];
  orderIndex?: number;
};

type Confirmation = {
  section_id: string;
  field_key: string;
  field_value: string | null;
  field_json: SectionField['field_json'];
  updated_at: string | null;
};

const aliases: Record<string, string[]> = {
  primary_button_text: ['primary_button_label'],
  primary_button_link: ['primary_button_url'],
  secondary_button_text: ['secondary_button_label'],
  secondary_button_link: ['secondary_button_url'],
};

function jsonOrEmpty(field: SectionField, value: string) {
  if (field.field_type !== 'json') return null;
  try {
    return value.trim() ? JSON.parse(value) : {};
  } catch {
    return field.field_json ?? {};
  }
}

export async function saveSectionField({ sectionId, fieldKey, fieldLabel, fieldType, value, jsonValue, orderIndex }: SaveArgs) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const payload = {
    section_id: sectionId,
    field_key: fieldKey,
    field_label: fieldLabel,
    field_type: fieldType,
    field_value: typeof value === 'string' ? value : '',
    field_json: jsonValue ?? {},
    order_index: orderIndex ?? 0,
  };
  const { error } = await supabase.from('section_fields').upsert(payload, { onConflict: 'section_id,field_key' });
  if (error) throw error;
}

export function SectionEditor({ section, fields }: { section: PageSection; fields: SectionField[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedFields, setSavedFields] = useState<SectionField[]>(fields);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSavedFields(fields);
    setValues(Object.fromEntries(fields.map((field) => [field.field_key, field.field_type === 'json' ? JSON.stringify(field.field_json ?? {}, null, 2) : field.field_value ?? ''])));
    setMessage('');
  }, [fields, section.id]);

  const dirtyKeys = useMemo(() => savedFields.filter((field) => values[field.field_key] !== (field.field_type === 'json' ? JSON.stringify(field.field_json ?? {}, null, 2) : field.field_value ?? '')).map((field) => field.field_key), [savedFields, values]);

  async function save() {
    if (!supabase) return setMessage('Erro Supabase: Supabase não configurado.');
    setSaving(true);
    setMessage('A guardar em public.section_fields...');
    try {
      const keysToSave = new Set(savedFields.map((field) => field.field_key));
      Object.entries(aliases).forEach(([legacy, aliasList]) => {
        if (keysToSave.has(legacy)) aliasList.forEach((alias) => keysToSave.add(alias));
      });
      const fieldsByKey = new Map(savedFields.map((field) => [field.field_key, field]));
      for (const key of keysToSave) {
        const sourceKey = fieldsByKey.has(key) ? key : Object.entries(aliases).find(([, aliasList]) => aliasList.includes(key))?.[0] ?? key;
        const sourceField = fieldsByKey.get(sourceKey);
        if (!sourceField) continue;
        const value = values[sourceKey] ?? '';
        await saveSectionField({
          sectionId: section.id,
          fieldKey: key,
          fieldLabel: key === sourceKey ? sourceField.field_label : key,
          fieldType: key.includes('_url') || key.includes('_link') ? 'url' : sourceField.field_type,
          value: sourceField.field_type === 'json' ? '' : value,
          jsonValue: jsonOrEmpty(sourceField, value),
          orderIndex: sourceField.order_index,
        });
      }
      const { data, error } = await supabase.from('section_fields').select('id,section_id,field_key,field_label,field_type,field_value,field_json,order_index,created_at,updated_at').eq('section_id', section.id).order('order_index', { ascending: true }).order('field_key', { ascending: true });
      if (error) throw error;
      const confirmed = (data ?? []) as SectionField[];
      setSavedFields(confirmed.filter((field) => fieldsByKey.has(field.field_key)));
      setValues((current) => ({ ...current, ...Object.fromEntries(confirmed.map((field) => [field.field_key, field.field_type === 'json' ? JSON.stringify(field.field_json ?? {}, null, 2) : field.field_value ?? ''])) }));
      const titleConfirmation = (confirmed as Confirmation[]).find((field) => field.field_key === 'title') ?? (confirmed as Confirmation[])[0];
      setMessage(titleConfirmation ? `Guardado com sucesso. section_id: ${titleConfirmation.section_id} · field_key: ${titleConfirmation.field_key} · valor confirmado no banco: ${titleConfirmation.field_value ?? JSON.stringify(titleConfirmation.field_json ?? {})} · updated_at: ${titleConfirmation.updated_at}` : 'Guardado com sucesso, mas a confirmação não devolveu campos.');
    } catch (error) {
      setMessage(`Erro Supabase: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  }

  return <section id={section.section_name} className="scroll-mt-8 rounded-3xl border border-white/10 bg-zinc-950/80 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-2xl font-bold text-sun">{section.section_name}</h3><p className="text-sm text-zinc-400">Chave: {section.section_key} · ordem {section.order_index} · {dirtyKeys.length ? `${dirtyKeys.length} alteração(ões)` : 'sem alterações'}</p></div><div className="flex gap-2 text-xs"><button type="button" className="rounded-full border border-white/10 px-3 py-2">Pré-visualizar</button><button type="button" className="rounded-full border border-white/10 px-3 py-2">Mover ↑</button><button type="button" className="rounded-full border border-white/10 px-3 py-2">Mover ↓</button><button type="button" disabled={saving} onClick={save} className="rounded-full bg-sun px-3 py-2 font-bold text-black disabled:opacity-60">{saving ? 'A guardar...' : 'Guardar'}</button></div></div><div className="mt-5 grid gap-4 md:grid-cols-2">{savedFields.map((field) => <EditableField key={field.id} field={{ ...field, field_value: values[field.field_key] ?? '' }} onChange={(value) => setValues((current) => ({ ...current, [field.field_key]: value }))} />)}</div>{message && <p className="mt-4 rounded-2xl border border-sun/20 bg-sun/10 p-3 text-sm text-sun">{message}</p>}</section>;
}
