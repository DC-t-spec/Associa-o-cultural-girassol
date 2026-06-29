import './globals.css';
import { ThemeDebugPanel } from '@/components/ui/ThemeDebugPanel';

export const metadata = {
  title: 'Associação Cultural Girassol | Teatro, Cultura e Juventude em Moçambique',
  description:
    'Site oficial da Associação Cultural Girassol, organização cultural moçambicana dedicada ao teatro, formação artística, intercâmbio cultural, acção social e ao FITI – Festival Internacional Teatro de Inverno.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="font-sans">{children}<ThemeDebugPanel /></body>
    </html>
  );
}
