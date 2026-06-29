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

As páginas públicas respeitam `page_sections.order_index` e `page_sections.is_active`, por isso o gestor pode reordenar ou ocultar secções sem mexer no código. Sem Supabase configurado, o site público continua funcional com os dados de fallback e `/admin` mostra um aviso elegante de configuração em vez de falhar.

## Configurar Supabase

1. Criar projecto no Supabase.
2. Executar `supabase/schema.sql` no SQL Editor.
5. Executar `supabase/seed.sql` no SQL Editor.
4. Criar um utilizador em Authentication.
5. Registar o utilizador em `admin_profiles` com `role = 'admin'`.
6. Configurar as variáveis públicas do frontend:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do projecto>
```

A anon key deve ser configurada no ambiente onde o site é executado. Nunca coloque a anon key em ficheiros versionados e nunca use a `service_role` key no frontend.

## Variáveis de ambiente locais

Crie um ficheiro `.env.local` a partir de `.env.local.example` e preencha os valores localmente:

```bash
cp .env.local.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do projecto>
```

O ficheiro `.env.local` não deve ser publicado no GitHub. Se uma variável ficar vazia, o fallback de `lib/data.ts` mantém o site público activo e o `/admin` mostra o aviso de configuração.

## Variáveis no GitHub Actions

No GitHub Pages, as variáveis `NEXT_PUBLIC_*` precisam de existir como GitHub Secrets e também precisam de ser passadas explicitamente ao passo `npm run build` no workflow `.github/workflows/deploy.yml`, porque o export estático incorpora estes valores públicos durante o build.

Configure os secrets em:

`GitHub repository > Settings > Secrets and variables > Actions > Repository secrets`

Crie os secrets:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

O workflow passa esses secrets apenas como variáveis de ambiente do build. Não guarde a anon key directamente no workflow, README ou outros ficheiros versionados, e não configure `service_role` em GitHub Actions para o frontend.

## Variáveis na Vercel

No painel da Vercel, abra:

`Project Settings > Environment Variables`

Adicione as variáveis para Production, Preview e Development, conforme necessário:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do projecto>
```

Depois faça redeploy. A Vercel injecta as variáveis no build e no runtime do frontend. Não use a `service_role` key em variáveis `NEXT_PUBLIC_*`.

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

Também pode abrir o CMS com dois cliques no logo principal do site, mantendo o acesso directo por `/admin`.

## Editar imagens, vídeos e PDFs

Use `Media Library` para guardar URLs vindas de Supabase Storage ou Cloudinary. O admin não grava binários em `public/` e o GitHub deve receber apenas código, SQL e texto.

## Mudar fundo e cores

Em `Aparência`, altere `theme_settings`: cores, gradientes, imagem de fundo, vídeo de fundo, partículas, luzes de palco, logo animado, intensidade de movimento, fontes e raios dos cards. O componente `DynamicBackground` aplica essas opções no site público.

## Editar homepage e FITI

- `Homepage`: gere `home_hero`, `home_about`, `home_mission_vision`, `home_timeline`, `home_what_we_do`, `home_projects`, `home_impact`, `home_gallery`, `home_news`, `home_partners` e `home_contact`.
- `FITI`: gere `fiti_hero`, `fiti_about`, `fiti_current_edition`, `fiti_program`, `fiti_companies`, `fiti_workshops`, `fiti_tickets`, `fiti_archive`, `fiti_partners`, `fiti_press` e `fiti_contact`.

## Publicar no GitHub Pages

Mantenha o `next.config.mjs` existente para export estático/basePath. Não dependa de `app/api` para contacto, inscrições ou admin; use Supabase client directamente. O workflow em `.github/workflows/deploy.yml` mantém compatibilidade com GitHub Pages, passa as variáveis públicas do Supabase durante o build e publica sempre a pasta `./out` gerada por `npm run build`.

No GitHub, configure a publicação em:

`GitHub > Settings > Pages > Build and deployment > Source: GitHub Actions`

Não use `Deploy from branch` para este projecto. Essa opção publica a raiz ou uma pasta do repositório directamente e pode mostrar o `README.md` em vez da aplicação Next.js exportada. A publicação correcta deve ser feita pelo workflow de GitHub Actions, que envia `./out` como artifact do Pages.

## Publicar na Vercel

Configure as mesmas variáveis Supabase no projecto Vercel e execute o deploy normalmente. API routes podem ser adicionadas apenas como opcionais, nunca como requisito do site.

## Boas práticas de conteúdo

Não usar textos genéricos. Quando faltar conteúdo real, usar: “Conteúdo em actualização. Em breve serão publicadas novas informações.”

## Como entrar no CMS

1. Aceder a `/admin` (ou `/Associa-o-cultural-girassol/admin/` no GitHub Pages quando o site usa `basePath`) ou dar dois cliques no logo principal do site.
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

No CMS, aceda a `/admin`, abra `Aparência`, active `animated_background_enabled`, active `animated_logo_enabled` e ajuste `animated_logo_opacity` e `animated_logo_speed`. A área de Aparência controla `animated_background_enabled`, `animated_logo_enabled`, `animated_logo_opacity`, `animated_logo_speed`, `background_motion_intensity`, cores, gradiente, partículas e luzes de palco.

Se preencher `animated_logo_url`, esse ficheiro é usado no movimento. Se não existir PNG/JPG, o site usa automaticamente um símbolo SVG inline inspirado no sol/girassol e máscara teatral da Associação Cultural Girassol, mantendo baixa opacidade e respeitando `prefers-reduced-motion`.

## Como mudar logotipos no CMS

1. Entrar no CMS em `/admin` com o utilizador configurado no Supabase Auth.
2. Ir a **Media Library** no CMS ou ao **Supabase Storage**.
3. Carregar o logotipo pretendido no storage/media.
4. Copiar o URL público da imagem carregada.
5. Ir a **Identidade Visual** no menu lateral do CMS.
6. Colar o URL em `site_logo_url` para o logotipo principal da Associação ou em `fiti_logo_url` para o logotipo do FITI. Também pode preencher `favicon_url`, `footer_logo_url`, `hero_logo_url` e `animated_logo_url` conforme necessário.
7. Guardar cada campo alterado com o botão **Guardar**.
8. Actualizar o site público para confirmar a navbar, hero, rodapé, página FITI e fundo animado.

Se um URL estiver vazio ou a imagem não carregar, o site mantém automaticamente os logotipos CSS/SVG de fallback, sem exigir ficheiros PNG/JPG no GitHub.

## Manual operacional do CMS depois do checkup

### Media Library

A área **Media Library** em `/admin` envia imagens, vídeos e PDFs para o bucket público `site-media`. O formulário pede título, descrição, texto alternativo, categoria e ficheiro. Depois do upload, o CMS obtém o URL público do Supabase Storage, grava o registo em `media_assets`, actualiza a listagem, permite copiar o URL, seleccionar o ficheiro em campos de identidade visual e apagar o registo quando necessário.

Pastas usadas automaticamente:

- `logos/`
- `fiti/`
- `gallery/`
- `partners/`
- `news/`
- `documents/`
- `videos/`

### Identidade Visual

Em **Identidade Visual**, cada campo tem label amigável, descrição, input, preview e botão **Seleccionar da Media Library**. O botão abre uma lista compacta dos ficheiros carregados e preenche o URL seleccionado. Ao guardar, o CMS faz `upsert` em `theme_settings`.

Chaves principais:

- `site_logo_url`, `site_logo_alt`
- `fiti_logo_url`, `fiti_logo_alt`
- `favicon_url`
- `footer_logo_url`
- `hero_logo_url`
- `animated_logo_url`, `animated_logo_enabled`, `animated_logo_opacity`, `animated_logo_speed`

### Aparência

Em **Aparência**, os campos foram apresentados com nomes humanos, como “Cor principal”, “Cor secundária”, “Activar fundo animado”, “Vídeo de fundo”, “Luzes de palco activas” e “Opacidade da camada”. Todos guardam em `theme_settings` e o site mantém fallback visual se alguma chave estiver vazia.

### Homepage e FITI

As áreas **Homepage** e **FITI** listam as secções existentes (`page_sections`) e campos (`section_fields`) que servem de base para editar textos, botões, mensagens de estado, títulos e descrições. Quando Supabase estiver vazio, os dados institucionais em `lib/data.ts` impedem páginas em branco.

### Menus e conteúdos estruturados

As áreas **Menus**, **Galeria**, **Notícias**, **Projectos**, **Timeline**, **Impacto**, **Parceiros**, **Programação FITI**, **Companhias FITI**, **Oficinas FITI** e **Arquivo FITI** têm interface de listagem, criação, edição, guardar, activar/desactivar e apagar quando aplicável. Cada área lê a respectiva tabela Supabase e mostra dados institucionais de fallback se a tabela ainda não tiver conteúdos.

### Formulários, contactos e imprensa

Os formulários públicos gravam directamente no Supabase através do cliente público quando configurado. No CMS, **Contactos** e **Imprensa** listam mensagens recebidas e permitem acompanhar o estado. Sem Supabase, a interface mostra uma mensagem clara em vez de quebrar.

## Resolver erros comuns

- **`/admin` mostra “Área de gestão indisponível”**: confirme `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no ambiente local, GitHub Secrets ou Vercel.
- **Login falha**: confirme que o utilizador existe em Supabase Auth e que o mesmo UUID está em `admin_profiles` com `role = 'admin'`.
- **Upload falha por bucket inexistente**: execute `supabase/schema.sql` ou crie o bucket público `site-media` manualmente se o SQL não tiver permissões para storage.
- **Media Library lista vazia**: confirme que `media_assets` existe, que RLS foi aplicado e que o utilizador está autenticado.
- **Build de GitHub Pages sem Supabase**: é esperado continuar a passar; o site público usa fallback e o CMS mostra aviso de configuração.
- **Logotipo não aparece**: confirme que o URL público abre no navegador. Se falhar, o site volta automaticamente para `GirassolLogo`, `FitiLogo` ou símbolo SVG do fundo animado.

## Como testar logotipos CMS → site público

1. Entrar em `/admin` com um utilizador existente no Supabase Auth e com perfil em `admin_profiles`.
2. Abrir **Media Library** no CMS e carregar a imagem pretendida. A Media Library grava o ficheiro no bucket público `site-media` com caminho único no formato `categoria/timestamp-uuid-nome.ext`.
3. Copiar ou seleccionar o URL público gerado pela Media Library.
4. Abrir **Identidade Visual**, escolher o campo pretendido (`site_logo_url`, `hero_logo_url`, `footer_logo_url`, `fiti_logo_url` ou `animated_logo_url`) e guardar.
5. Abrir a área **Diagnóstico** no CMS e executar **Testar ligação Supabase**, **Testar leitura theme_settings**, **Testar gravação theme_settings**, **Testar upload site-media** e **Testar leitura pública dos logotipos**.
6. Abrir o site público com `?debug=theme`, por exemplo `https://dc-t-spec.github.io/Associa-o-cultural-girassol/?debug=theme`.
7. Confirmar na caixa de debug que `theme_settings carregado` está como `sim` e que `site_logo_url`, `hero_logo_url`, `footer_logo_url`, `fiti_logo_url` ou `animated_logo_url` mostram o URL guardado.
8. Confirmar na mesma caixa que o `ManagedLogo` correspondente indica `imagem real`, a `key usada` correcta e o URL público esperado.
9. Actualizar a página. O logotipo deve mudar sem deploy novo, sem hardcode e sem imagem adicionada ao GitHub. Se aparecer `fallback`, verificar a mensagem exacta do Diagnóstico: RLS, bucket `site-media`, URL vazio, utilizador sem admin ou erro real devolvido pelo Supabase.
