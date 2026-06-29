import { getNavigation, getPageSections, getSectionFields, getThemeSettings } from '@/lib/cms';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cmsEmptyState } from '@/lib/data';
import { toSafeString } from '@/lib/utils';

export const dynamic = 'force-static';

type AuditRow = { area: string; component: string; table: string; field: string; supabaseValue: string; resolvedValue: string; expected: string; status: 'CMS' | 'fallback' | 'vazio' | 'erro' };
const fallback = cmsEmptyState;

function short(value: unknown) { const s = toSafeString(value, '').trim(); return s.length > 180 ? `${s.slice(0, 180)}…` : s; }
function state(value: unknown, resolved: unknown): AuditRow['status'] { if (short(value)) return 'CMS'; if (short(resolved)) return 'fallback'; return 'vazio'; }
async function count(table: string, query?: (q: any) => any) {
  if (!isSupabaseConfigured || !supabase) return { value: '', status: 'fallback' as const };
  try { const q = supabase.from(table).select('*', { count: 'exact', head: true }); const r = await (query ? query(q) : q); return r.error ? { value: r.error.message, status: 'erro' as const } : { value: `${r.count ?? 0} registo(s)`, status: (r.count ?? 0) > 0 ? 'CMS' as const : 'vazio' as const }; } catch (e) { return { value: e instanceof Error ? e.message : 'Erro', status: 'erro' as const }; }
}
async function sectionRows(areaPrefix: string, component: string, sectionKey: string, fields: string[]) {
  const rows: AuditRow[] = [];
  const data = await getSectionFields(sectionKey);
  const map: Record<string, unknown> = {};
  for (const f of data) {
    const value = f.field_value || (f.field_json ? JSON.stringify(f.field_json) : '');
    map[f.field_key] = value;
    if (f.field_key === 'primary_button_text') map.primary_button_label ??= value;
    if (f.field_key === 'primary_button_label') map.primary_button_text ??= value;
    if (f.field_key === 'primary_button_link') map.primary_button_url ??= value;
    if (f.field_key === 'primary_button_url') map.primary_button_link ??= value;
    if (f.field_key === 'secondary_button_text') map.secondary_button_label ??= value;
    if (f.field_key === 'secondary_button_label') map.secondary_button_text ??= value;
    if (f.field_key === 'secondary_button_link') map.secondary_button_url ??= value;
    if (f.field_key === 'secondary_button_url') map.secondary_button_link ??= value;
  }
  for (const key of fields) { const val = map[key] ?? ''; rows.push({ area: `${areaPrefix} ${key}`, component, table: 'page_sections + section_fields', field: `${sectionKey}.${key}`, supabaseValue: short(val), resolvedValue: short(val) || fallback, expected: short(val) || 'fallback institucional', status: state(val, fallback) }); }
  return rows;
}

export default async function CmsAuditPage() {
  const [theme, homeSections, fitiSections, mainMenu, footerMenu, fitiMenu] = await Promise.all([getThemeSettings(), getPageSections('home'), getPageSections('fiti'), getNavigation('main_menu'), getNavigation('footer_menu'), getNavigation('fiti_menu')]);
  const rows: AuditRow[] = [];
  const themeKeys = [['Homepage Navbar logo','Navbar','theme_settings','site_logo_url'],['Homepage WhatsApp','WhatsApp','theme_settings','whatsapp_url'],['Homepage Footer logo','Footer','theme_settings','footer_logo_url'],['Homepage Footer contactos','Footer','theme_settings','contact_email/contact_location'],['Homepage Fundo animado','DynamicBackground','theme_settings','animated_background_enabled/background_type'],['FITI FitiHero logo','FitiHero','theme_settings','fiti_logo_url'],['FITI Fundo FITI','DynamicBackground','theme_settings','background_type/background_image_url/background_video_url']];
  for (const [area, component, table, field] of themeKeys) { const val = field.split('/').map((k) => `${k}=${short((theme as any)[k])}`).join(' | '); rows.push({ area, component, table, field, supabaseValue: val, resolvedValue: val || 'fallback institucional', expected: val || 'fallback institucional', status: val.replace(/[^=]+=($| \| )/g,'') ? 'CMS' : 'fallback' }); }
  rows.push({ area:'Homepage Navbar menu', component:'Navbar', table:'navigation_items', field:"location='main_menu'", supabaseValue:`${mainMenu.length} item(s): ${mainMenu.map(i=>i.label).join(', ')}`, resolvedValue:'Supabase se houver itens; fallback só se vazio; duplicados removidos por label+url', expected:'Menu ordenado e sem duplicados', status: mainMenu.length?'CMS':'fallback' });
  rows.push({ area:'Homepage Footer menu', component:'Footer', table:'navigation_items', field:"location='footer_menu'", supabaseValue:`${footerMenu.length} item(s)`, resolvedValue:'Supabase se houver itens; fallback só se vazio', expected:'Footer ordenado', status: footerMenu.length?'CMS':'fallback' });
  rows.push({ area:'FITI Menu FITI', component:'FitiPage', table:'navigation_items', field:"location='fiti_menu'", supabaseValue:`${fitiMenu.length} item(s)`, resolvedValue:'Supabase se houver itens; fallback só se vazio', expected:'Submenu FITI ordenado', status: fitiMenu.length?'CMS':'fallback' });
  rows.push({ area:'Homepage secções activas/ordem', component:'app/page.tsx', table:'page_sections', field:"page_slug='home', is_active=true", supabaseValue:homeSections.map(s=>s.section_key).join(', '), resolvedValue:'Renderiza pela ordem de page_sections', expected:'Secção inactiva não aparece', status:homeSections.length?'CMS':'fallback' });
  rows.push({ area:'FITI secções activas/ordem', component:'app/fiti/page.tsx', table:'page_sections', field:"page_slug='fiti', is_active=true", supabaseValue:fitiSections.map(s=>s.section_key).join(', '), resolvedValue:'Renderiza pela ordem de page_sections', expected:'Secção inactiva não aparece', status:fitiSections.length?'CMS':'fallback' });
  rows.push(...await sectionRows('Homepage Hero','Hero','home_hero',['eyebrow','title','subtitle','description','primary_button_label','primary_button_url','secondary_button_label','secondary_button_url','hero_logo_url']));
  rows.push(...await sectionRows('Homepage Quem Somos','About','home_about',['section_title','section_text','image_url','image_caption','button_text']));
  rows.push(...await sectionRows('Homepage Missão/Visão/Valores','About','home_mission_vision',['mission','vision','values']));
  rows.push(...await sectionRows('Homepage O que fazemos','WhatWeDo','home_what_we_do',['section_title','cards']));
  rows.push(...await sectionRows('FITI Hero','FitiHero','fiti_hero',['eyebrow','title','subtitle','description','primary_button_label','primary_button_url','secondary_button_label','secondary_button_url']));
  rows.push(...await sectionRows('FITI Sobre','FitiAbout','fiti_about',['section_title','section_text']));
  rows.push(...await sectionRows('FITI Imprensa','PressKit','fiti_press',['section_title','section_text','cards']));
  for (const [area, component, table, field, filter] of [
    ['Homepage Timeline','Timeline','timeline','is_active=true','is_active'],['Homepage Projectos','Projects','projects','is_active=true','is_active'],['Homepage Impacto','Impact','impact_stats','is_active=true','is_active'],['Homepage Galeria','Gallery','gallery','is_active=true','is_active'],['Homepage Notícias','News','news','published=true','published'],['Homepage Parceiros','Partners','partners','is_active=true, show_on_home=true','home'],['FITI Edição actual','CurrentEdition','fiti_editions','active=true','active'],['FITI Programação','Program','fiti_program','is_active=true','is_active'],['FITI Companhias','Companies','fiti_companies','is_active=true','is_active'],['FITI Oficinas','Workshops','fiti_workshops','is_active=true','is_active'],['FITI Arquivo','FitiArchive','fiti_archive','is_active=true','is_active'],['FITI Parceiros','FitiPartners','partners','is_active=true, show_on_fiti=true','fiti'],['Formulários Contacto','Contact/FitiForms','contact_messages/fiti_applications','insert anon/RLS','forms'],['Redes sociais','Footer','social_links','is_active=true','is_active']
  ] as any[]) { const c = await count(table, q => filter==='published'?q.eq('published',true):filter==='active'?q.eq('active',true):filter==='home'?q.eq('is_active',true).eq('show_on_home',true):filter==='fiti'?q.eq('is_active',true).eq('show_on_fiti',true):filter==='forms'?q:q.eq('is_active',true)); rows.push({ area, component, table, field, supabaseValue:c.value, resolvedValue:c.status==='CMS'?'Dados reais consumidos pelo componente':'Fallback/mensagem vazia institucional', expected:c.status==='CMS'?'Renderiza dados CMS':'Renderiza estado em actualização', status:c.status }); }
  return <main className="min-h-screen bg-black p-6 text-white"><h1 className="font-display text-4xl text-sun">Auditoria CMS → Site Público</h1><p className="mt-2 text-zinc-300">Matriz técnica para localizar falhas entre Supabase, helpers, componentes e fallback. theme_settings.value tem prioridade; value_json vazio não sobrepõe value.</p><div className="mt-6 overflow-x-auto"><table className="min-w-[1200px] border-collapse text-left text-sm"><thead><tr className="bg-zinc-900 text-sun">{['Área','Componente','Tabela','Campo/chave','Valor na Supabase','Valor resolvido pelo hook/helper','Valor renderizado esperado','Estado'].map(h=><th key={h} className="border border-white/10 p-3">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.area}-${i}`} className="odd:bg-zinc-950 even:bg-zinc-900/60"><td className="border border-white/10 p-3 font-semibold">{r.area}</td><td className="border border-white/10 p-3">{r.component}</td><td className="border border-white/10 p-3">{r.table}</td><td className="border border-white/10 p-3">{r.field}</td><td className="border border-white/10 p-3 text-zinc-300">{r.supabaseValue || 'vazio'}</td><td className="border border-white/10 p-3 text-zinc-300">{r.resolvedValue}</td><td className="border border-white/10 p-3 text-zinc-300">{r.expected}</td><td className="border border-white/10 p-3"><span className={r.status==='CMS'?'text-emerald-300':r.status==='erro'?'text-red-300':'text-yellow-300'}>{r.status}</span></td></tr>)}</tbody></table></div></main>;
}
