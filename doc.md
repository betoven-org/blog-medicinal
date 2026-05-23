# Blog Medicinal

Portal de conteudo sobre saude, suplementos naturais e fitoterapia com catalogo de produtos farmaceuticos. Inclui CMS administrativo completo, integracao com Supabase como fonte de verdade, sistema de assinaturas Stripe e SEO avancado.

## O que o projeto entrega

### Para o visitante (usuario final)

- **Portal de conteudo** — artigos sobre saude organizados por categorias (Saude, Emagrecedor, Nutricosmetico, Ativos, Fit, Dermocosmeticos, etc.), com hero article na home, secoes editoriais (Escolha do Editor, Tendencias, Novidades, Mais Lidas) e secoes dinamicas por categoria
- **Catalogo de produtos** — vitrine de produtos farmaceuticos com galeria de imagens (zoom fullscreen, navegacao por setas), descricao detalhada, composicao, instrucoes de uso, beneficios e diferenciais. Cada produto tem botao "Fale com o farmaceutico" que abre conversa no WhatsApp
- **Busca live** — barra de busca com resultados em tempo real (debounce 250ms) mostrando posts e produtos, acessivel pelo header em qualquer pagina
- **Navegacao por categorias** — menu horizontal com pills, filtragem por categoria tanto de posts quanto de produtos, paginacao
- **Newsletter** — formulario de inscricao no footer para captacao de leads
- **Pagina de autor** — perfil do autor com seus artigos publicados
- **Politica de privacidade** — pagina institucional editavel pelo CMS
- **RSS Feed** — feed XML para leitores RSS

### Para o administrador (CMS)

- **Dashboard** — metricas do CMS (posts, publicados, rascunhos, categorias, inscritos, midias) + analytics com timeseries, paginas mais acessadas, referrers, paises, dispositivos, SO e browsers. Filtro por periodo (7d/30d/90d)
- **Gestao de posts** — CRUD completo com drawer lateral, editor rich text TipTap (visual + markdown), upload de hero image, selecao de categoria/autor, excerpt, status draft/published, destaque, agendamento de publicacao
- **SEO avancado por post** — meta title, meta description, focus keyword, secondary keywords, OG title/description/image, canonical URL, schema type (Article, NewsArticle, BlogPosting...), noindex/nofollow, SEO score, SEO notes, word count automatico, reading time
- **Gestao de produtos** — CRUD com galeria de imagens multiplas, composicao, instrucoes de uso, quem pode usar, beneficios (titulo + subtitulo), diferenciais, marca, flag is_kit, show_on_site, noindex
- **Categorias** — categorias de posts e categorias de produtos (com hierarquia pai/filho, imagem, ordenacao)
- **Autores** — nome, slug, bio, avatar
- **Biblioteca de midias** — upload para Vercel Blob com variantes automaticas (thumbnail, card, hero), gestao e exclusao
- **Usuarios** — gestao com roles (admin, editor, author, viewer)
- **Inscritos** — lista de subscribers da newsletter
- **Operacoes em bulk** — selecao multipla em qualquer listagem com acoes (publicar, despublicar, excluir)
- **Busca global (Cmd+K)** — busca unificada por posts, produtos, categorias e autores
- **Configuracoes do site** — nome, descricao, logo, favicon, redes sociais (Facebook, Instagram, YouTube), textos do footer/copyright, configuracao da newsletter (titulo, descricao, consentimento), SEO global (title, description, keywords), politica de privacidade, robots.txt (index, follow, disallow)
- **Sync com Supabase** — importacao/atualizacao do conteudo do Supabase do cliente (articles, categories, tags, products) com upsert (nunca apaga), barra de progresso via SSE em tempo real, acionavel manualmente ou via webhook
- **Assinatura Stripe** — checkout, portal do cliente, webhook para lifecycle de subscription, cron para verificar assinaturas expiradas, pagina de pagamento pendente
- **Variaveis de ambiente** — interface para gerenciar env vars e dominios pelo CMS

### SEO e Performance

- **Sitemap dinamico** — gerado automaticamente com todos os posts e produtos publicados
- **Robots.txt dinamico** — configuravel pelo CMS (index, follow, disallow rules)
- **RSS Feed** — `/feed.xml` automatico
- **Dados estruturados JSON-LD** — Article/BlogPosting/NewsArticle por post (schema type configuravel), Product nos PDPs, com wordCount, keywords, articleSection
- **Open Graph + Twitter Cards** — metadata completa por post e por pagina
- **Canonical URLs** — configuravel por post ou automatica
- **noindex/nofollow** — granular por post e por produto
- **Static generation** — `generateStaticParams` para posts publicados
- **Cache** — `unstable_cache` com tags granulares para revalidation on-demand via `/api/revalidate`
- **Imagens** — AVIF/WebP, sizes otimizados por contexto, lazy load em nao-criticas, priority/fetchPriority no LCP
- **Fonts** — Roboto com `font-display: swap`, preload
- **CSS** — `optimizeCss` habilitado, sem dark mode CSS desnecessario
- **Browserslist** — moderno (Chrome 109+, Safari 16+) para eliminar polyfills
- **Preconnect** — origins externas (framerusercontent, vteximg)
- **Navigation progress** — barra de progresso durante navegacao

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15.4 (App Router) + React 19 |
| Estilizacao | Tailwind CSS 4 + tw-animate-css |
| ORM | Drizzle ORM (type-safe) |
| Banco de dados | Neon PostgreSQL (production) |
| Source of truth | Supabase (cliente) |
| Autenticacao | NextAuth v5 (beta) |
| Pagamentos | Stripe (assinaturas) |
| Upload | Vercel Blob |
| Editor | TipTap (rich text + markdown) |
| UI Components | shadcn/ui + Lucide icons + SVG inline |
| Node | >= 22 (obrigatorio) |

## Arquitetura

```
src/
├── app/
│   ├── (admin)/admin/         # CMS completo (10 paginas)
│   ├── (frontend)/            # Site publico (11 rotas)
│   │   └── api/               # Newsletter, busca, revalidate
│   └── api/
│       ├── admin/             # 15 endpoints protegidos + bulk
│       ├── auth/              # NextAuth
│       ├── webhooks/          # Stripe + Supabase sync
│       ├── cron/              # Check subscriptions
│       └── search/            # Busca publica
├── components/
│   ├── admin/                 # 22 componentes do CMS
│   ├── ui/                    # 11 primitives shadcn
│   └── *.tsx                  # 17 componentes frontend
├── db/
│   ├── schema.ts              # 11 tabelas + relations
│   ├── index.ts               # Drizzle client
│   ├── seed.ts                # Seed data
│   └── setup.ts               # DB setup
├── lib/
│   ├── queries.ts             # Queries centralizadas com cache
│   ├── supabase.ts            # Supabase client
│   ├── stripe.ts              # Stripe client
│   ├── utils.ts               # Helpers (resolveRelation, cn)
│   ├── formatDate.ts          # Formatacao pt-BR
│   └── slug.ts                # Geracao de slugs
├── middleware.ts               # Auth middleware
└── styles/                     # Estilos globais
```

## Banco de Dados (11 tabelas)

| Tabela | Campos principais | Observacoes |
|--------|------------------|-------------|
| `users` | name, email, passwordHash, role (admin/editor/author/viewer) | Autenticacao CMS |
| `posts` | title, slug, excerpt, content (JSON TipTap), categoryId, authorId, heroImageId, coverUrl, status, featured, publishedAt + **10 campos SEO** (metaTitle, metaDescription, focusKeyword, secondaryKeywords, ogTitle, ogDescription, ogImageUrl, schemaType, canonicalUrl, seoScore, seoNotes, noindex, nofollow, wordCount, readingTimeMinutes, lastSeoReviewAt, approvedAt) | supabase_id para sync |
| `products` | name, slug, description, content (JSON), composition, usageInstructions, whoCanUse, benefits (JSON), differentials (JSON), productCategoryId, imageId, galleryImages (JSON), seoTitle, seoDescription, brand, isKit, showOnSite, noindex, status, featured | Catalogo farmaceutico |
| `categories` | name, slug, description | Categorias de posts, supabase_id |
| `product_categories` | name, slug, description, parentId (hierarquia), imageId, sortOrder | Categorias de produtos |
| `authors` | name, slug, bio, avatarId | supabase_id |
| `media` | filename, alt, url, thumbnailUrl, cardUrl, heroUrl, mimeType, size | supabaseUrl para sync |
| `tags` | postId, tag | Tags por post |
| `subscribers` | email, active | Newsletter |
| `site_settings` | siteName, siteDescription, logoId, faviconId, redes sociais, newsletter config, SEO global, privacyPolicy, robots config, supabase credentials, syncEnabled | Singleton |
| `subscriptions` | tenantId, status (active/overdue/suspended), nextDueDate, graceDays, stripe IDs | Assinatura Stripe |

Relacoes: posts -> categories, authors, media, tags. products -> product_categories, media. product_categories -> self (parent/child), media. authors -> media (avatar). site_settings -> media (logo, favicon).

IDs: UUID no Supabase, serial int local (mapeado via `supabase_id`).

## Paginas Publicas (Frontend)

| Rota | O que entrega |
|------|--------------|
| `/` | Home editorial: hero article em destaque, Escolha do Editor (3 cards), pills de categorias, Tendencias (8 trend cards) + sidebar Posts Recentes, banner de destaque, secoes por categoria (top 3), Novidades (8 cards compactos), Mais Lidas (top 5 numerado) |
| `/blog` | Listagem de todos os posts publicados com paginacao |
| `/posts/[slug]` | Post completo com hero image, breadcrumb, badge de categoria, autor/data, conteudo rich text, posts relacionados (mesma categoria), dados estruturados JSON-LD, OG/Twitter meta |
| `/categorias` | Grid de todas as categorias |
| `/categorias/[slug]` | Posts filtrados por categoria com paginacao |
| `/autores/[slug]` | Perfil do autor + seus posts |
| `/produtos` | Catalogo completo de produtos publicados com paginacao |
| `/produtos/[slug]` | Produtos de uma categoria especifica com paginacao (grid 4 colunas, cards com botao WhatsApp) |
| `/[slug]/p` | PDP: galeria com zoom fullscreen, composicao, instrucoes de uso, quem pode usar, beneficios, diferenciais, botao WhatsApp, breadcrumb, dados estruturados Product |
| `/search` | Pagina de resultados de busca |
| `/politica-de-privacidade` | Texto da politica de privacidade (editavel pelo CMS) |

## CMS Administrativo

| Rota | Funcionalidade |
|------|---------------|
| `/admin` | Dashboard: cards de metricas (posts, publicados, rascunhos, categorias, inscritos, midias) + analytics (timeseries chart, overview, top paginas, referrers, paises, device types, OS, browsers) com filtro de periodo |
| `/admin/posts` | DataTable com busca, filtro por status, selecao multipla, bulk actions. PostDrawer lateral com editor TipTap (visual/markdown toggle), upload hero image, campos SEO completos |
| `/admin/posts/novo` | Criacao de post |
| `/admin/posts/[id]` | Edicao de post |
| `/admin/produtos` | DataTable de produtos com bulk actions. ProductDrawer com galeria de imagens, campos de produto farmaceutico |
| `/admin/categorias` | CRUD categorias de posts. CategoryDrawer |
| `/admin/categorias-produto` | CRUD categorias de produtos com hierarquia. ProductCategoryDrawer |
| `/admin/autores` | CRUD autores. AuthorDrawer. Paginas novo/[id] |
| `/admin/midias` | Biblioteca de midias: grid de imagens, upload, edicao de alt/filename, exclusao |
| `/admin/usuarios` | Gestao de usuarios + roles. UserDrawer |
| `/admin/inscritos` | Lista de subscribers da newsletter |
| `/admin/configuracoes` | Tabs: Geral (nome, descricao, logo, favicon), Redes Sociais, Newsletter, SEO (title, description, keywords), Paginas (politica de privacidade), Robots (index, follow, disallow), Supabase (credentials + sync com barra de progresso SSE), Assinatura Stripe |
| `/admin/pagamento-pendente` | Tela para assinaturas expiradas/suspensas |
| `/admin/login` | Autenticacao por email/senha |

## API Routes

### Admin (protegidas por auth)
| Endpoint | Metodos | Funcao |
|----------|---------|--------|
| `/api/admin/posts` | GET, POST | Listar/criar posts |
| `/api/admin/posts/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir post |
| `/api/admin/posts/bulk` | POST | Publicar/despublicar/excluir em massa |
| `/api/admin/products` | GET, POST | Listar/criar produtos |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir produto |
| `/api/admin/products/bulk` | POST | Acoes em massa em produtos |
| `/api/admin/categories` | GET, POST | Listar/criar categorias |
| `/api/admin/categories/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir categoria |
| `/api/admin/categories/bulk` | POST | Acoes em massa em categorias |
| `/api/admin/product-categories` | GET, POST | Listar/criar categorias de produto |
| `/api/admin/product-categories/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir |
| `/api/admin/product-categories/bulk` | POST | Acoes em massa |
| `/api/admin/authors` | GET, POST | Listar/criar autores |
| `/api/admin/authors/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir autor |
| `/api/admin/authors/bulk` | POST | Acoes em massa em autores |
| `/api/admin/media` | GET, POST | Listar/upload midias |
| `/api/admin/media/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir midia |
| `/api/admin/users` | GET, POST | Listar/criar usuarios |
| `/api/admin/users/[id]` | GET, PUT, DELETE | Detalhe/editar/excluir usuario |
| `/api/admin/subscribers` | GET | Lista inscritos newsletter |
| `/api/admin/analytics` | GET | Metricas do dashboard |
| `/api/admin/search` | GET | Busca global admin |
| `/api/admin/settings` | GET, POST | Ler/salvar configuracoes do site |
| `/api/admin/supabase-sync` | POST, DELETE | Sync upsert (SSE) / Truncate + resync |
| `/api/admin/upload` | POST | Upload de arquivo |
| `/api/admin/domains` | GET, POST | Gestao de dominios |
| `/api/admin/env-vars` | GET, POST | Gestao de variaveis de ambiente |
| `/api/admin/subscription` | GET | Status da assinatura |
| `/api/admin/stripe/checkout` | POST | Criar sessao Stripe Checkout |
| `/api/admin/stripe/portal` | POST | Abrir Stripe Customer Portal |

### Publicas
| Endpoint | Funcao |
|----------|--------|
| `/api/search` | Busca publica (posts + produtos, ilike case-insensitive) |
| `/api/subscription-status` | Status da assinatura Stripe |
| `(frontend)/api/newsletter` | Inscricao newsletter |
| `(frontend)/api/search` | Busca frontend |
| `(frontend)/api/revalidate` | Revalidation on-demand por tag |

### Webhooks e Cron
| Endpoint | Funcao |
|----------|--------|
| `/api/webhooks/stripe` | Eventos Stripe (subscription lifecycle) |
| `/api/webhooks/supabase-sync` | Webhook para sync automatico |
| `/api/cron/check-subscriptions` | Verifica assinaturas expiradas |

### SEO automatico
| Rota | Funcao |
|------|--------|
| `/sitemap.ts` | Sitemap dinamico com posts + produtos publicados |
| `/robots.ts` | Robots.txt dinamico (configuravel pelo CMS) |
| `/feed.xml` | RSS feed |

## Sync com Supabase

O Supabase do cliente (`hsixbybpwvhvkwxeaxup.supabase.co`) e a fonte de verdade para conteudo. Tabelas sincronizadas: articles (104), categories (7), tags (7), article_tags (N:N), products (191).

Fluxo:
1. Admin clica "Sincronizar" em `/admin/configuracoes` ou webhook dispara
2. `POST /api/admin/supabase-sync` faz fetch de todas as tabelas do Supabase
3. Upsert no banco local: insere novos, atualiza existentes, **nunca apaga dados locais**
4. Mapeamento de IDs: UUID do Supabase -> serial int local via campo `supabase_id`
5. Conteudo markdown do Supabase e armazenado como `{type:"doc", _html:"..."}` no campo content
6. Streaming SSE envia progresso em tempo real para a UI (barra de progresso)

Para reset completo: `DELETE /api/admin/supabase-sync` (truncate cascade + resync).

## Componentes

### Frontend (17 componentes)
| Componente | Descricao |
|-----------|-----------|
| `Header` | Grid 3 colunas (breadcrumb, busca, user menu + botoes Area Restrita/Fale Conosco), sticky z-50, 2 linhas |
| `CategoryMenu` | Pills horizontais com scroll, categorias que possuem produtos publicados (EXISTS query), "Ver Todos os Produtos" fixo |
| `MobileMenu` | Hamburger modal (w-80 z-50), overlay, Esc handler, body overflow control |
| `SearchBar` | Input com dropdown live results, debounce 250ms, ilike case-insensitive, mostra produtos + posts |
| `SearchButton` / `SearchModal` | Atalho de busca e modal |
| `HeroArticle` | Banner principal do post destaque na home |
| `ArticleCard` | Card de artigo com imagem, categoria, autor, data. Variante com priority/fetchPriority para LCP |
| `ArticleCardCompact` | Card menor para secao Novidades |
| `ArticleCardSmall` | Card minimo (titulo + autor + data) para sidebar |
| `TrendCard` | Card horizontal para secao Tendencias |
| `CategoryBadge` | Badge de categoria com link |
| `Breadcrumb` | Navegacao breadcrumb |
| `ProductGallery` | Galeria com setas always visible, zoom modal fullscreen, sem limite de imagens, sem duplicatas |
| `TipTapRenderer` | Renderiza content TipTap JSON ou detecta `_html` e converte markdown para HTML |
| `NewsletterForm` | Formulario de inscricao com feedback de sucesso/erro |
| `NavigationProgress` | Barra de progresso durante navegacao entre paginas |
| `Skeleton` | Loading skeleton |
| `Footer` | Rodape com newsletter, redes sociais, copyright |

### Admin (22 componentes)
| Componente | Descricao |
|-----------|-----------|
| `AdminShell` | Layout com sidebar + header |
| `Sidebar` / `NavLink` / `Logo` | Navegacao lateral |
| `AdminHeader` | Header do admin |
| `Dashboard` | Metricas CMS + Analytics (timeseries, ranked lists) |
| `DataTable` | Tabela generica com selecao, paginacao, acoes bulk |
| `BulkBar` | Barra de acoes em massa |
| `PostDrawer` | Edicao de post com TipTap (visual/markdown toggle), campos SEO |
| `ProductDrawer` | Edicao de produto com galeria multipla |
| `CategoryDrawer` | Edicao de categoria |
| `ProductCategoryDrawer` | Edicao de categoria de produto |
| `AuthorDrawer` | Edicao de autor |
| `UserDrawer` | Edicao de usuario |
| `Drawer` | Componente base de drawer lateral |
| `RichTextEditor` | TipTap com toolbar completa |
| `ImageUpload` | Upload com preview |
| `FormField` | Campo de formulario generico (suporta type="password" para chaves sensiveis) |
| `GlobalSearch` | Cmd+K busca global |
| `DeleteConfirm` | Modal de confirmacao de exclusao |
| `StatusBadge` | Badge de status (draft/published) |
| `Spinner` / `Icon` | Utilitarios |
| `AssinaturaSection` | Secao de assinatura Stripe nas configuracoes |
| `DomainsField` / `DomainsView` | Gestao de dominios |
| `EnvVarsField` / `EnvVarsView` | Gestao de variaveis de ambiente |
| `BeforeLogin` | Tela pre-login |

### UI Primitives (shadcn/ui - 11)
badge, button, checkbox, dialog, dropdown-menu, popover, select, separator, sheet, table, tooltip

## Variaveis de Ambiente

```
DATABASE_URL              # Neon PostgreSQL connection string
NEXTAUTH_SECRET           # Secret para NextAuth
NEXTAUTH_URL              # URL base da aplicacao
NEXT_PUBLIC_SITE_URL      # URL publica do site
STRIPE_SECRET_KEY         # Stripe server key
STRIPE_WEBHOOK_SECRET     # Stripe webhook signing secret
BLOB_READ_WRITE_TOKEN     # Vercel Blob token para uploads
```

Credenciais Supabase sao armazenadas no banco (`site_settings`) e gerenciadas pelo CMS, nao por env vars.
