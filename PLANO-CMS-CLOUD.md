# Plano: Brasa CMS Cloud + Frontend Separado

## Visao Geral

Separar o Brasa CMS em dois projetos independentes:

```
brasa-cms/          (cloud — admin + API)
brasa-starter/      (template — frontend Next.js)
```

O CMS vira um servico centralizado. Cada cliente tem um frontend que consome a API do CMS por HTTP.

```
                    cms.brasa.app (1 deploy)
                    ┌──────────────────────────┐
                    │  Admin Panel              │
                    │  API REST (/api/v1/*)     │
                    │  Page Builder             │
                    │  Auth (NextAuth)          │
                    │  Neon PostgreSQL           │
                    │  Supabase Storage          │
                    └────────────┬─────────────┘
                                 │
                    API Key + Tenant ID (header)
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
         Site A              Site B              Site C
         (Next.js)           (Next.js)           (Next.js)
         front only          front only          front only
         Vercel              Vercel              Vercel
```

---

## Fase 1 — API Publica no CMS (backend)

Objetivo: expor endpoints REST publicos (read-only) que o frontend consome.

### 1.1 Criar rota base `/api/v1/`

Prefixo versionado. Todas as rotas publicas ficam aqui.

### 1.2 Endpoints necessarios

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/api/v1/posts` | GET | Lista posts (mode: recent/trending/popular/editor-picks, limit, offset) |
| `/api/v1/posts/:slug` | GET | Post completo por slug |
| `/api/v1/posts/featured` | GET | Post destaque |
| `/api/v1/categories` | GET | Lista categorias |
| `/api/v1/categories/:slug` | GET | Posts de uma categoria |
| `/api/v1/authors` | GET | Lista autores |
| `/api/v1/authors/:slug` | GET | Posts de um autor |
| `/api/v1/products` | GET | Lista produtos |
| `/api/v1/products/:slug` | GET | Produto por slug |
| `/api/v1/product-categories` | GET | Categorias de produtos |
| `/api/v1/pages/:slug` | GET | Sections JSON de uma pagina |
| `/api/v1/settings` | GET | Site settings (nome, logo, cores, whatsapp, analytics) |
| `/api/v1/search` | GET | FTS (q=termo) |
| `/api/v1/sitemap` | GET | Dados pra gerar sitemap no frontend |
| `/api/v1/feed` | GET | Dados pra gerar RSS no frontend |

### 1.3 Autenticacao da API

- Header: `x-api-key: <tenant_api_key>`
- Cada tenant tem uma `api_key` na tabela `tenants` (gerada no init)
- Middleware valida key e injeta `tenant_id` no contexto
- Rate limit por API key (ex: 1000 req/min)

### 1.4 Cache

- Endpoints publicos retornam `Cache-Control: s-maxage=60, stale-while-revalidate=300`
- Revalidacao on-demand: quando admin publica algo, CMS faz webhook pro frontend (purge)
- Header `x-revalidate-secret` no webhook pra seguranca

### 1.5 Schema do banco — adicionar na tabela tenants

```sql
ALTER TABLE tenants ADD COLUMN api_key TEXT UNIQUE;
ALTER TABLE tenants ADD COLUMN frontend_url TEXT;        -- pra webhooks de revalidacao
ALTER TABLE tenants ADD COLUMN revalidate_secret TEXT;   -- secret pro webhook
```

---

## Fase 2 — Frontend Starter (template)

Objetivo: criar o `brasa-starter`, projeto Next.js limpo que consome a API.

### 2.1 Estrutura

```
brasa-starter/
  src/
    lib/
      cms.ts              -- SDK client (fetch wrapper tipado)
      types.ts            -- tipos (Post, Category, Page, Settings, etc)
    sections/             -- mesmas sections (HeroPost, PostGrid, etc)
    components/
      SectionRenderer.tsx -- renderiza JSON de sections
    app/
      (frontend)/         -- paginas publicas
        page.tsx           -- home (consome /api/v1/pages/home)
        [slug]/page.tsx    -- post
        posts/[slug]/page.tsx
        produtos/[slug]/page.tsx
        blog/page.tsx
      sitemap.ts
      feed.xml/route.ts
      api/
        revalidate/route.ts  -- webhook do CMS pra purge
```

### 2.2 SDK Client (`cms.ts`)

```typescript
const CMS_URL = process.env.CMS_URL;        // https://cms.brasa.app
const CMS_API_KEY = process.env.CMS_API_KEY; // api key do tenant

async function cms<T>(path: string, opts?: { revalidate?: number }): Promise<T> {
  const res = await fetch(`${CMS_URL}/api/v1${path}`, {
    headers: { "x-api-key": CMS_API_KEY },
    next: { revalidate: opts?.revalidate ?? 60 },
  });
  if (!res.ok) throw new Error(`CMS ${res.status}: ${path}`);
  return res.json();
}

// Funcoes tipadas
export const getPosts = (mode, limit) => cms<Post[]>(`/posts?mode=${mode}&limit=${limit}`);
export const getPost = (slug) => cms<Post>(`/posts/${slug}`);
export const getPages = (slug) => cms<Page>(`/pages/${slug}`);
export const getSettings = () => cms<Settings>(`/settings`);
// ...
```

### 2.3 Env vars do frontend

```env
# Unicas vars necessarias
CMS_URL="https://cms.brasa.app"
CMS_API_KEY="brs_xxxxxxxxxxxx"
NEXT_PUBLIC_SITE_URL="https://www.cliente.com.br"
```

### 2.4 Sections

- Mesmas sections de hoje, mas em vez de chamar `getPostsByMode()` direto no banco, recebem dados via props (ja fazem isso parcialmente)
- `SectionRenderer` continua igual — recebe JSON da API, renderiza componente
- Sections novas podem ser adicionadas no frontend (manifest local)

---

## Fase 3 — Environments (dev/staging/prod)

### 3.1 Como funciona

O CMS cloud e unico. Os dados sao por tenant. O frontend e que tem branches.

| Branch frontend | CMS_URL | Dados |
|-----------------|---------|-------|
| `main` | cms.brasa.app | Producao (conteudo publicado) |
| `develop` | cms.brasa.app | Mesmo tenant, mas flag `?draft=true` mostra rascunhos |
| Feature branch | cms.brasa.app | Mesmo tenant, mesmos dados |

Os dados **nao** mudam por branch — o que muda e o codigo do frontend. Isso simplifica muito.

### 3.2 Preview de rascunhos

- API aceita `?draft=true` com header extra `x-preview-secret`
- Frontend em branch de dev usa esse param pra mostrar conteudo nao publicado
- Producao nunca envia `?draft=true`

### 3.3 Vercel Preview Deployments

- Cada PR gera preview automatico na Vercel
- Preview usa mesmo `CMS_API_KEY` (mesmo tenant)
- Env var `VERCEL_ENV=preview` pode ativar draft mode automaticamente

---

## Fase 4 — Init automatizado

### 4.1 Fluxo novo

```bash
# 1. Criar tenant no CMS (via admin ou CLI)
#    Gera: api_key, revalidate_secret

# 2. Clonar starter
git clone brasa-starter cliente-x
cd cliente-x

# 3. Rodar init
pnpm init:project
#    Pergunta: CMS_API_KEY, dominio
#    Gera: .env.local completo
#    Cria projeto Vercel + env vars
#    Deploy
```

### 4.2 O que o init precisa (muito mais simples)

Antes: DATABASE_URI, NEXTAUTH_SECRET, tenant no banco, 15+ env vars
Agora: CMS_API_KEY + dominio. So.

### 4.3 Criar tenant via API do CMS

```
POST cms.brasa.app/api/admin/tenants
Authorization: Bearer <master_key>
{
  "name": "Farmacia X",
  "slug": "farmacia-x",
  "domain": "www.farmacia-x.com.br",
  "adminEmail": "admin@farmacia-x.com.br",
  "adminPassword": "..."
}

Response: {
  "tenantId": 42,
  "apiKey": "brs_abc123...",
  "revalidateSecret": "rv_xyz789..."
}
```

Isso permite que o `pnpm init:project` do starter crie o tenant remotamente sem precisar de acesso direto ao banco.

---

## Fase 5 — Webhook de revalidacao

### 5.1 CMS -> Frontend

Quando admin publica/edita conteudo no CMS:

1. CMS faz POST pra `frontend_url/api/revalidate`
2. Header: `x-revalidate-secret`
3. Body: `{ "paths": ["/", "/posts/slug-do-post"], "tags": ["posts", "pages"] }`
4. Frontend faz `revalidatePath()` ou `revalidateTag()`

### 5.2 Configuracao

- `frontend_url` fica na tabela `tenants`
- CMS dispara webhook automaticamente nos handlers de publish/update/delete
- Se `frontend_url` estiver vazio, nao dispara (backwards compatible)

---

## Ordem de execucao

| # | Tarefa | Dependencia | Esforco |
|---|--------|-------------|---------|
| 1 | Adicionar `api_key`, `frontend_url`, `revalidate_secret` na tabela tenants | - | P |
| 2 | Criar middleware de API key (`/api/v1/*`) | 1 | P |
| 3 | Implementar endpoints `/api/v1/*` (extrair dos loaders existentes) | 2 | M |
| 4 | Testes dos endpoints (pode ser com curl/httpie) | 3 | P |
| 5 | Deploy do CMS cloud (cms.brasa.app) | 3 | P |
| 6 | Criar `brasa-starter` — copiar frontend, trocar loaders por SDK | 5 | G |
| 7 | Criar `cms.ts` SDK client | 6 | M |
| 8 | Adaptar sections pra receber dados via props | 7 | M |
| 9 | Webhook de revalidacao (CMS -> frontend) | 6 | M |
| 10 | Endpoint de criar tenant via API | 5 | P |
| 11 | Novo `init:project` no starter (simples, so API key) | 10 | P |
| 12 | Draft/preview mode | 3 | P |
| 13 | Testar fluxo completo (criar tenant, init starter, deploy) | 11 | M |

**P** = pequeno (1-2h) | **M** = medio (3-5h) | **G** = grande (6-10h)

Estimativa total: ~35-45h

---

## Decisoes tecnicas

1. **REST vs GraphQL** — REST. Mais simples, cacheable por CDN, sem overhead de schema. GraphQL so faz sentido se tiver muitas combinacoes de queries, que nao e o caso.

2. **API no mesmo Next.js** — Sim. A API `/api/v1/*` fica no mesmo projeto do admin. Nao precisa de servico separado. Next.js route handlers sao suficientes.

3. **SDK como package vs fetch direto** — Comeca como arquivo local (`cms.ts`). Se crescer, vira package `@brasa/sdk` no monorepo. Nao over-engineer agora.

4. **Sections no frontend** — As sections continuam no frontend (nao no CMS). O CMS so armazena o JSON `{ component, props }`. O frontend resolve o componente e renderiza. Isso permite customizacao por cliente.

5. **Manifest** — Cada frontend tem seu proprio manifest de sections. O CMS precisa conhecer o manifest pra mostrar no page builder. Solucao: frontend expoe `/api/manifest` que o CMS consome pra popular o editor. Ou: manifest e sincronizado via upload no deploy.

6. **Media/Upload** — Continua no CMS (Supabase Storage). Frontend referencia URLs publicas do Supabase. Sem mudanca.

7. **Auth** — Admin auth fica 100% no CMS. Frontend nao tem auth (site publico). Se precisar de area logada no frontend (ex: area do assinante), usa session do CMS via API.

---

## Riscos e mitigacoes

| Risco | Mitigacao |
|-------|-----------|
| Latencia extra (frontend -> CMS API -> banco) | ISR com revalidate + CDN cache nos endpoints |
| Page builder precisa conhecer sections do frontend | Endpoint `/api/manifest` ou sync no deploy |
| Sections customizadas por cliente quebram editor | Manifest por tenant, editor carrega dinamicamente |
| Migration do monolito atual | Manter backwards compatible — CMS continua funcionando como monolito ate migrar |
| Complexidade de 2 deploys | Simplificado pelo fato do CMS ser unico e centralizado |

---

## O que NAO muda

- Banco Neon compartilhado (multitenant como hoje)
- Supabase Storage pra media
- Admin panel (fica no CMS)
- Page builder (fica no CMS)
- Sections (mesmos componentes, so mudam de onde vem os dados)
- Schema Drizzle (@brasa/core)
