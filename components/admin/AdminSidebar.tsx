'use client';
const items=['Dashboard','Páginas','Homepage','FITI','Menus','Secções','Aparência','Media Library','Galeria','Notícias','Projectos','Timeline','Impacto','Parceiros','Programação FITI','Companhias FITI','Oficinas FITI','Arquivo FITI','Imprensa','Formulários','Contactos','SEO','Definições'];
export function AdminSidebar(){return <aside className="sticky top-4 h-fit rounded-3xl border border-sun/20 bg-zinc-950/95 p-4">{items.map(i=><a key={i} href={`#${i}`} className="block rounded-2xl px-4 py-2 text-sm text-zinc-300 hover:bg-sun/10 hover:text-sun">{i}</a>)}</aside>}
