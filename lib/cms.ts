import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { siteSettings, cmsFallbackPages, cmsFallbackSections, cmsFallbackFields, cmsFallbackNavigation, cmsFallbackTheme, cmsFallbackMedia } from '@/lib/data';
import type { MediaAsset, NavigationItem, Page, PageSection, SectionField, ThemeSettings } from '@/types/cms';
import { toSafeString } from '@/lib/utils';

const empty = 'Conteúdo em actualização. Em breve serão publicadas novas informações.';
const SUPABASE_READ_TIMEOUT_MS = 5000;
const getBrowserSupabase = () => (typeof window !== 'undefined' && isSupabaseConfigured ? supabase : null);

async function withFallback<T>(request: PromiseLike<{ data: T | null; error: unknown }>, fallback: T): Promise<T> {
  if (!getBrowserSupabase()) return fallback;

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const response = await Promise.race([
      Promise.resolve(request),
      new Promise<{ data: null; error: Error }>((resolve) => {
        timeout = setTimeout(() => resolve({ data: null, error: new Error('Supabase read timed out') }), SUPABASE_READ_TIMEOUT_MS);
      }),
    ]);

    return response.error || response.data === null ? fallback : response.data;
  } catch {
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function getFallbackPage(slug: string): Page {
  return cmsFallbackPages.find((p) => p.slug === slug) ?? { id: `fallback-${slug}`, slug, title: slug, seo_title: siteSettings.seoTitle, seo_description: siteSettings.seoDescription, is_published: true };
}

export function getFallbackTheme(): ThemeSettings {
  return cmsFallbackTheme;
}

export async function getPage(slug: string): Promise<Page> {
  const fallback = getFallbackPage(slug);
  const db = getBrowserSupabase();
  if (!db) return fallback;
  return withFallback<Page>(db.from('pages').select('*').eq('slug', slug).maybeSingle(), fallback);
}

export async function getPageSections(slug: string): Promise<PageSection[]> {
  const fallback = cmsFallbackSections.filter((s) => s.page_slug === slug && s.is_active).sort((a, b) => a.order_index - b.order_index);
  const db = getBrowserSupabase();
  if (!db) return fallback;
  return withFallback<PageSection[]>(db.from('page_sections').select('*').eq('page_slug', slug).eq('is_active', true).order('order_index'), fallback);
}

export async function getSectionFields(sectionKey: string): Promise<SectionField[]> {
  const fallback = cmsFallbackFields[sectionKey] ?? [{ id: `${sectionKey}-empty`, section_id: sectionKey, field_key: 'empty_state_text', field_label: 'Mensagem padrão', field_type: 'textarea', field_value: empty, order_index: 1 } satisfies SectionField];
  const db = getBrowserSupabase();
  if (!db) return fallback;

  const section = await withFallback<{ id: string }>(db.from('page_sections').select('id').eq('section_key', sectionKey).maybeSingle(), { id: '' });
  if (!section.id) return fallback;

  return withFallback<SectionField[]>(db.from('section_fields').select('*').eq('section_id', section.id).order('order_index'), fallback);
}

function normaliseThemeValue(value: unknown, fallback: unknown) {
  if (typeof fallback === 'boolean') return toSafeString(value, 'false') === 'true';

  if (typeof fallback === 'number') {
    const parsed = Number(toSafeString(value, String(fallback)));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return toSafeString(value, toSafeString(fallback));
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  const db = getBrowserSupabase();
  if (!db) return getFallbackTheme();

  const data = await withFallback<Array<{ key: string; value: string | null; value_json: unknown }>>(db.from('theme_settings').select('key,value,value_json'), []);
  if (!data.length) return getFallbackTheme();

  return data.reduce((acc, row) => {
    const raw = row.value !== null && row.value !== undefined && row.value !== '' ? row.value : row.value_json;
    return { ...acc, [row.key]: normaliseThemeValue(raw, acc[row.key as keyof ThemeSettings]) };
  }, getFallbackTheme());
}

export async function getNavigation(location: NavigationItem['location']): Promise<NavigationItem[]> {
  const fallback = cmsFallbackNavigation.filter((n) => n.location === location && n.is_active).sort((a, b) => a.order_index - b.order_index);
  const db = getBrowserSupabase();
  if (!db) return fallback;
  return withFallback<NavigationItem[]>(db.from('navigation_items').select('*').eq('location', location).eq('is_active', true).order('order_index'), fallback);
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  const db = getBrowserSupabase();
  if (!db) return cmsFallbackMedia;
  return withFallback<MediaAsset[]>(db.from('media_assets').select('*').order('created_at', { ascending: false }), cmsFallbackMedia);
}
