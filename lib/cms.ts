import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { siteSettings, cmsFallbackPages, cmsFallbackSections, cmsFallbackFields, cmsFallbackNavigation, cmsFallbackTheme, cmsFallbackMedia } from '@/lib/data';
import type { MediaAsset, NavigationItem, Page, PageSection, SectionField, ThemeSettings } from '@/types/cms';

const empty='Conteúdo em actualização. Em breve serão publicadas novas informações.';
export function getFallbackPage(slug:string):Page{return cmsFallbackPages.find(p=>p.slug===slug)??{id:`fallback-${slug}`,slug,title:slug,seo_title:siteSettings.seoTitle,seo_description:siteSettings.seoDescription,is_published:true};}
export function getFallbackTheme():ThemeSettings{return cmsFallbackTheme;}
export async function getPage(slug:string):Promise<Page>{if(!supabase||!isSupabaseConfigured)return getFallbackPage(slug);const{data,error}=await supabase.from('pages').select('*').eq('slug',slug).maybeSingle();return error||!data?getFallbackPage(slug):data as Page;}
export async function getPageSections(slug:string):Promise<PageSection[]>{if(!supabase||!isSupabaseConfigured)return cmsFallbackSections.filter(s=>s.page_slug===slug&&s.is_active).sort((a,b)=>a.order_index-b.order_index);const{data,error}=await supabase.from('page_sections').select('*').eq('page_slug',slug).eq('is_active',true).order('order_index');return error||!data?cmsFallbackSections.filter(s=>s.page_slug===slug&&s.is_active):data as PageSection[];}
export async function getSectionFields(sectionKey:string):Promise<SectionField[]>{const fallback=cmsFallbackFields[sectionKey]??[{id:`${sectionKey}-empty`,section_id:sectionKey,field_key:'empty_state_text',field_label:'Mensagem padrão',field_type:'textarea',field_value:empty,order_index:1} satisfies SectionField];if(!supabase||!isSupabaseConfigured)return fallback;const{data:section}=await supabase.from('page_sections').select('id').eq('section_key',sectionKey).maybeSingle();if(!section)return fallback;const{data,error}=await supabase.from('section_fields').select('*').eq('section_id',section.id).order('order_index');return error||!data?fallback:data as SectionField[];}
function normaliseThemeValue(value: unknown, fallback: unknown) {
  if (typeof fallback === 'boolean') return value === true || value === 'true';
  if (typeof fallback === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return value ?? fallback;
}
export async function getThemeSettings():Promise<ThemeSettings>{if(!supabase||!isSupabaseConfigured)return getFallbackTheme();const{data,error}=await supabase.from('theme_settings').select('key,value,value_json');if(error||!data)return getFallbackTheme();return data.reduce((acc,row:{key:string;value:string|null;value_json:unknown})=>{const raw=row.value_json??row.value;return {...acc,[row.key]:normaliseThemeValue(raw,acc[row.key as keyof ThemeSettings])};},getFallbackTheme());}
export async function getNavigation(location:NavigationItem['location']):Promise<NavigationItem[]>{if(!supabase||!isSupabaseConfigured)return cmsFallbackNavigation.filter(n=>n.location===location&&n.is_active).sort((a,b)=>a.order_index-b.order_index);const{data,error}=await supabase.from('navigation_items').select('*').eq('location',location).eq('is_active',true).order('order_index');return error||!data?cmsFallbackNavigation.filter(n=>n.location===location&&n.is_active):data as NavigationItem[];}
export async function getMediaAssets():Promise<MediaAsset[]>{if(!supabase||!isSupabaseConfigured)return cmsFallbackMedia;const{data,error}=await supabase.from('media_assets').select('*').order('created_at',{ascending:false});return error||!data?cmsFallbackMedia:data as MediaAsset[];}
