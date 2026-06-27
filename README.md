# Associação Cultural Girassol + FITI

Site premium em Next.js, TypeScript, Tailwind CSS, Framer Motion, Supabase, React Hook Form e Lucide React, pronto para Vercel.

## Instalação

```bash
npx create-next-app@latest girassol-site --typescript --tailwind --eslint --app
cd girassol-site
npm install framer-motion lucide-react @supabase/supabase-js react-hook-form clsx tailwind-merge
```

Neste repositório o projecto já está criado. Para instalar:

```bash
npm install
```


## Validação de dependências

O `package.json` mantém as dependências solicitadas: Next.js, React, React DOM, Framer Motion, Lucide React, Supabase JS, React Hook Form, clsx e tailwind-merge. O registry oficial está fixado em `.npmrc`:

```bash
npm config set registry https://registry.npmjs.org/
npm install
npm run build
```

Se uma rede corporativa/proxy bloquear o npm registry com `403 Forbidden`, o código continua preparado para fallback de conteúdo quando Supabase não estiver configurado, mas a instalação das dependências precisa de acesso ao registry oficial ou a um mirror autorizado.

## Rodar localmente

```bash
npm run dev
```

Depois abra `http://localhost:3000`.

## Supabase

1. Crie um projecto no Supabase.
2. Copie `.env.local.example` para `.env.local`.
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase.
5. Configure autenticação para proteger `/admin` em produção.

Sem Supabase configurado, o site usa conteúdos temporários em `lib/data.ts`.

## Admin

A rota `/admin` contém a estrutura de dashboard para actualizar associação, FITI, programação, galeria, notícias, parceiros, inscrições e contactos. Os cartões estão preparados para ligação operacional às tabelas Supabase.

## Deploy na Vercel

1. Envie o repositório para GitHub/GitLab.
2. Importe o projecto na Vercel.
3. Configure as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Faça deploy com o preset Next.js.

## Logos e assets

Esta versão não inclui ficheiros binários de imagem para os logos. As marcas visuais foram substituídas por componentes CSS/Tailwind em `components/ui/GirassolLogo.tsx` e `components/ui/FitiLogo.tsx`, evitando avisos de diff sobre ficheiros binários.

Os logos oficiais poderão ser adicionados manualmente mais tarde na pasta `public/logos/`. Para usar imagens no futuro, basta trocar a implementação interna de `GirassolLogo` e `FitiLogo` por componentes de imagem, mantendo as chamadas aos componentes no restante site.

Adicione vídeos opcionais em `public/videos/` para enriquecer os heroes sem tornar imagens obrigatórias.
