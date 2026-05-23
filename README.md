# Brasa CMS

CMS multitenant com Next.js 15, Drizzle ORM e PostgreSQL. Sistema de sections configuravel estilo deco.cx.

## Stack

- Next.js 15 + React 19 + Tailwind 4
- Drizzle ORM + Neon PostgreSQL (multitenant)
- NextAuth (credentials)
- pnpm workspaces + turborepo

## Pacotes

| Pacote | O que faz |
|---|---|
| `@brasa/core` | Schema, auth, FTS search, validations, slug |
| `@brasa/admin` | 33 componentes admin UI |
| `@brasa/api` | 12 route handlers |

## Requisitos

- Node.js >= 22
- pnpm
- gh CLI (`brew install gh`)
- Vercel CLI (`npm i -g vercel`)
- Banco PostgreSQL (Neon recomendado)

---

## Novo projeto (passo a passo)

### 1. Fork o repo

No GitHub, fork `betoven-org/blog-medicinal` para a org do cliente (privado).

Ou via CLI:

```bash
gh repo fork betoven-org/blog-medicinal --clone --remote-name origin
cd blog-medicinal
```

### 2. Configurar banco

O banco e compartilhado (multitenant). Copie o `.env.example`:

```bash
cp .env.example .env.local
```

Preencha o `DATABASE_URI` com a connection string do Neon compartilhado.

Se for o primeiro projeto (banco novo), rode o schema:

```bash
pnpm db:push
```

### 3. Instalar dependencias

```bash
pnpm install
```

### 4. Rodar o setup

```bash
pnpm init:project
```

O script interativo pede:
- Nome do site
- Slug do tenant (ex: `farmacia-x`)
- Dominio (ex: `www.farmacia-x.com.br`)
- Nome/email/senha do admin
- WhatsApp
- Vercel team (opcional)

E cria automaticamente:
- Tenant no banco
- Usuario admin
- Site settings
- Paginas default (home com sections)
- Subscription ativa (30 dias)
- Guias de ajuda
- Projeto na Vercel com env vars
- Primeiro deploy

### 5. Desenvolvimento local

```bash
pnpm dev
```

Abre `http://localhost:3000` (frontend) e `http://localhost:3000/admin` (CMS).

---

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Next.js + watcher de sections (auto-sync manifest) |
| `pnpm build` | Gera manifest + build Next.js |
| `pnpm manifest` | Regenera manifest.json manualmente |
| `pnpm init:project` | Setup completo de novo projeto (tenant + Vercel + deploy) |
| `pnpm tenant:create` | Cria tenant no banco (sem Vercel) |
| `pnpm dev:next` | So o Next.js (sem watcher) |
| `pnpm dev:watch` | So o watcher de sections |

---

## Sections

O CMS gera campos de edicao automaticamente a partir dos tipos TypeScript dos componentes.

Veja [SECTIONS.md](./SECTIONS.md) para documentacao completa.

### Sections disponiveis

| Section | O que faz |
|---|---|
| HeroPost | Destaque 2/3 + lista lateral 1/3 |
| CategoryBar | Pills de categorias |
| PostGrid | Grade configuravel (5 modos de filtro) |
| PostList | Lista vertical numerada |
| PostGridWithSidebar | Grid 2/3 + lista lateral 1/3 |
| ProductShowcase | Vitrine de produtos (4 modos) |
| WhatsAppCTA | Banner CTA pro WhatsApp |
| Hero | Hero generico |
| Features | Grid de features |
| Banner | Banner promocional |

### Modos de filtro

| Modo | Fonte | Descricao |
|---|---|---|
| `recent` | `publishedAt DESC` | Posts mais recentes |
| `trending` | `request_metrics` (7 dias) | Mais vistos na semana |
| `popular` | `request_metrics` (all-time) | Mais vistos total |
| `editor-picks` | `featured = true` | Marcados como destaque |
| `manual` | Slugs informados | Selecao manual |

### Criar nova section

1. Crie um `.tsx` em `src/components/sections/`
2. Exporte `interface Props` com JSDoc annotations
3. Salve — o watcher regenera o manifest automaticamente
4. Registre no `SectionRenderer.tsx`

---

## Multitenant

Cada cliente e um tenant no mesmo banco. Isolamento por `tenant_id` em todas as tabelas.

- **Middleware**: resolve tenant pelo host (dominio ou subdominio)
- **Queries**: filtram por `tenant_id` via `getTenantId()`
- **RLS**: policies no PostgreSQL como camada extra de seguranca
- **Tabela `tenants`**: mapeia slug, dominio, subdominio para cada cliente

---

## Estrutura

```
packages/
  brasa-core/           Schema, auth, search, validations
  brasa-admin/          Componentes admin UI
  brasa-api/            Route handlers

src/
  app/
    (admin)/admin/      Paginas do CMS admin
    (frontend)/         Paginas do blog
    api/                API routes (re-exports do @brasa/api)
  components/
    sections/           Sections configuraveis (Hero, PostGrid, etc)
    SectionRenderer.tsx Renderiza sections no frontend
  lib/
    queries.ts          Queries cached do frontend
    loaders.ts          Loaders de posts por modo
    tenant.ts           Helpers de tenant (getTenantId)
    search.ts           FTS com PostgreSQL

scripts/
  extract-sections.ts   Gera manifest.json (ts-morph)
  watch-sections.ts     Watcher auto-sync
  init-project.ts       Setup de novo projeto
  create-tenant.ts      Cria tenant no banco
```

---

## Documentacao adicional

- [SECTIONS.md](./SECTIONS.md) — Como criar e configurar sections
- [GUIA-SESSOES-HOME.md](./GUIA-SESSOES-HOME.md) — Guia para o cliente configurar a home
