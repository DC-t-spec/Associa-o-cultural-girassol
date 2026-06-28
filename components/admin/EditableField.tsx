'use client';

import type { ChangeEvent } from 'react';
import type { SectionField } from '@/types/cms';

const selectOptions: Record<string, string[]> = {
  background_motion_intensity: ['low', 'medium', 'high'],
  background_type: ['mixed', 'gradient', 'image', 'video', 'none'],
  button_style: ['rounded', 'square', 'pill'],
};

export function EditableField({ field, onChange }: { field: SectionField; onChange?: (value: string) => void }) {
  const common = {
    name: field.field_key,
    defaultValue: field.field_value,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange?.(e.target.value),
    className: 'mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-sun',
  };

  return (
    <label className="block text-sm text-zinc-300">
      <span>{field.field_label}</span>
      {field.field_type === 'textarea' || field.field_type === 'richtext' || field.field_type === 'json' ? (
        <textarea {...common} className={`${common.className} min-h-28`} />
      ) : field.field_type === 'boolean' ? (
        <select {...common}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      ) : field.field_type === 'select' ? (
        <select {...common}>
          {(selectOptions[field.field_key] ?? [field.field_value]).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : field.field_type === 'color' ? (
        <input {...common} type="color" />
      ) : (
        <input {...common} type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'url' ? 'url' : 'text'} />
      )}
    </label>
  );
}
