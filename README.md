# Associação Cultural Girassol + FITI

Site institucional da Associação Cultural Girassol e do FITI com estrutura de CMS editável via `/admin`, mantendo export estático para GitHub Pages e compatibilidade com Vercel.

## Instalação

```bash
npm install
npm run dev
```

## Build e lint

```bash
npm run lint
npm run build
```

## Como funciona o CMS

O código mantém apenas a estrutura visual. O conteúdo público é carregado por `lib/cms.ts` nesta ordem:

1. Supabase, quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem.
2. `lib/data.ts`, como fallback institucional inicial.
3. Mensagem final de actualização quando uma área ainda não tem conteúdo.

As páginas públicas respeitam `page_sections.order_index` e `page_sections.is_active`, por isso o gestor pode reordenar ou ocultar secções sem mexer no código.

## Configurar Supabase

1. Criar projecto no Supabase.
2. Executar `supabase/schema.sql` no SQL Editor.
3. Executar `supabase/seed.sql` no SQL Editor.
4. Criar um utilizador em Authentication.
5. Definir variáveis no `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Sem Supabase configurado, `/admin` mostra a mensagem elegante de indisponibilidade e o site público continua a funcionar com fallback.

## Primeiro admin

Crie o utilizador no painel Supabase Auth e, no SQL Editor, registe o UUID em `admin_profiles` com `role = admin`. A função `is_admin()` usa esse perfil para permitir gestão do CMS, media e formulários.

## Tabelas principais

- `admin_profiles`
- `pages`
- `page_sections`
- `section_fields`
- `theme_settings`
- `media_assets`
- `navigation_items`
- `social_links`
- `content_revisions`
- `news`
- `partners`
- `gallery`
- `projects`
- `impact_stats`
- `timeline`
- `fiti_editions`
- `fiti_program`
- `fiti_companies`
- `fiti_workshops`
- `fiti_archive`
- `fiti_applications`
- `contact_messages`

## Editar textos

Aceda a `/admin`, entre com Supabase Auth, abra `Homepage`, `FITI` ou `Secções` e altere os campos gerados por `section_fields`. Cada campo define o tipo (`text`, `textarea`, `richtext`, `url`, `color`, `boolean`, `json`, etc.).

## Editar imagens, vídeos e PDFs

Use `Media Library` para guardar URLs vindas de Supabase Storage ou Cloudinary. O admin não grava binários em `public/` e o GitHub deve receber apenas código, SQL e texto.

## Mudar fundo e cores

Em `Aparência`, altere `theme_settings`: cores, gradientes, imagem de fundo, vídeo de fundo, partículas, luzes de palco, logo animado, intensidade de movimento, fontes e raios dos cards. O componente `DynamicBackground` aplica essas opções no site público.

## Editar homepage e FITI

- `Homepage`: gere `home_hero`, `home_about`, `home_mission_vision`, `home_timeline`, `home_what_we_do`, `home_projects`, `home_impact`, `home_gallery`, `home_news`, `home_partners` e `home_contact`.
- `FITI`: gere `fiti_hero`, `fiti_about`, `fiti_current_edition`, `fiti_program`, `fiti_companies`, `fiti_workshops`, `fiti_tickets`, `fiti_archive`, `fiti_partners`, `fiti_press` e `fiti_contact`.

## Publicar no GitHub Pages

Mantenha o `next.config.mjs` existente para export estático/basePath. Não dependa de `app/api` para contacto, inscrições ou admin; use Supabase client directamente.

## Publicar na Vercel

Configure as mesmas variáveis Supabase no projecto Vercel e execute o deploy normalmente. API routes podem ser adicionadas apenas como opcionais, nunca como requisito do site.

## Boas práticas de conteúdo

Não usar textos genéricos. Quando faltar conteúdo real, usar: “Conteúdo em actualização. Em breve serão publicadas novas informações.”

## Como entrar no CMS

1. Aceder a `/admin` (ou `/Associa-o-cultural-girassol/admin/` no GitHub Pages quando o site usa `basePath`).
2. Criar projecto Supabase.
3. Executar `supabase/schema.sql` no SQL Editor.
4. Executar `supabase/seed.sql` no SQL Editor.
5. Criar utilizador em Authentication.
6. Copiar o User UID.
7. Inserir o utilizador em `admin_profiles` com `role = 'admin'`.
8. Configurar as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
9. Fazer login em `/admin` com o email e password do utilizador criado.

Se as variáveis Supabase não existirem, a página `/admin` não fica em branco: mostra uma mensagem elegante com os passos de configuração.

## Como activar o logo em movimento no fundo

No CMS, aceda a `Admin > Aparência > Fundo animado > Logo em movimento` e active as opções de fundo animado e logo em movimento. A área de Aparência controla `animated_background_enabled`, `animated_logo_enabled`, `animated_logo_opacity`, `animated_logo_speed`, `background_motion_intensity`, cores, gradiente, partículas e luzes de palco.

Se carregar um logo no CMS (`animated_logo_url` ou imagem de fundo), esse ficheiro é usado no movimento. Se não existir PNG/JPG, o site usa automaticamente um símbolo SVG inline inspirado no sol/girassol e máscara teatral da Associação Cultural Girassol, mantendo baixa opacidade e respeitando `prefers-reduced-motion`.
