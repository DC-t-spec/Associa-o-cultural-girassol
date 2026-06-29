'use client';

import { usePublicRows, dedupePublicRows } from '@/hooks/usePublicRows';
import { usePublicSection, publicFieldMap } from '@/hooks/usePublicSection';
import { toSafeString } from '@/lib/utils';

const empty = 'Conteúdo em actualização. Em breve serão publicadas novas informações.';

export const fieldMap = publicFieldMap;
export const dedupeRows = dedupePublicRows;

export function useSection(sectionKey: string) { return usePublicSection(sectionKey).data; }
export function useRows<T extends Record<string, any>>(table: string, fallback: T[], query?: (q: any) => any) { return usePublicRows(table, fallback, query).data; }
export function text(value: unknown, fallback = empty) { return toSafeString(value, fallback).trim() || fallback; }
export function bool(value: unknown, fallback = false) { if (typeof value === 'boolean') return value; const v = text(value, String(fallback)).toLowerCase(); return ['true','1','yes','sim'].includes(v); }
export function img(value: unknown) { const v = text(value, ''); return v.startsWith('http') || v.startsWith('/') ? v : ''; }
