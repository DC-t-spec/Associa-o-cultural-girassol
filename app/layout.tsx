import type { Metadata } from 'next';
import './globals.css';
import { getThemeSettings } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata>{const settings=await getThemeSettings();const icons=settings.favicon_url?{icon:settings.favicon_url,shortcut:settings.favicon_url,apple:settings.favicon_url}:undefined;return {metadataBase:new URL('https://girassol-site.vercel.app'),title:'Associação Cultural Girassol | Teatro, Cultura e Juventude em Moçambique',description:'Site oficial da Associação Cultural Girassol, organização cultural moçambicana dedicada ao teatro, formação artística, intercâmbio cultural, acção social e ao FITI – Festival Internacional Teatro de Inverno.',icons,openGraph:{title:'Associação Cultural Girassol',description:'Teatro, juventude, memória e transformação cultural em Moçambique.',type:'website'},twitter:{card:'summary_large_image'}};}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt"><body className="font-sans">{children}</body></html>}
