# Arquitetura — Blog Medicinal CMS

## Estado atual

Monorepo Next.js 15 com CMS admin e frontend no mesmo deploy. O admin produz conteudo (posts, produtos, paginas) e o frontend consome via queries Drizzle server-side diretas.

```
src/
├── app/(admin)/       # CMS (17 rotas)
├── app/(frontend)/    # Site publico (11 rotas)
├── app/api/admin/     # API protegida (34 endpoints)
├── app/api/           # API publica (search, newsletter, revalidate)
├── components/admin/  # 22 componentes CMS
├── components/        # 17 componentes frontend
├── db/                # Schema Drizzle + client (compartilhado)
├── lib/queries.ts     # Queries do frontend (acessa db direto)
└── lib/validations.ts # Schemas Zod (17 schemas)
```

### Pontos de acoplamento

| Camada | Acoplamento | Descricao |
|--------|-------------|-----------|
| `db/schema.ts` | Alto | Schema Drizzle compartilhado entre CMS e frontend |
| `lib/queries.ts` | Alto | 13 paginas do frontend importam queries que acessam `db` direto |
| 5 arquivos frontend | Medio | Importam `@/db` inline (produtos, robots.txt) |
| `auth.ts` | Baixo | NextAuth so e usado pelo admin, mas vive no root |
| `middleware.ts` | Baixo | Logica admin + subscription check num arquivo so |
| Componentes | Nenhum | Admin e frontend ja estao isolados |

---

## Arquitetura proposta — Manifest + SDK

Desacoplar o CMS do frontend sem over-engineering. O CMS vira um pacote que exporta um manifest tipado e um SDK com hooks. O frontend consome via SDK, sem saber nada sobre Drizzle, banco ou API interna.

### Estrutura de pacotes

```
packages/
├── types/                # @medicinal/types
│   ├── post.ts           # Post, PostListParams, PostListResponse
│   ├── product.ts        # Product, ProductListParams, etc
│   ├── category.ts       # Category
│   ├── author.ts         # Author
│   ├── page.ts           # Page, PageDraft
│   ├── settings.ts       # SiteSettings
│   └── index.ts          # Re-export tudo
│
├── cms/                  # @medicinal/cms
│   ├── db/               # Schema Drizzle, client, migrations
│   ├── api/              # Endpoints admin + publicos
│   ├── admin/            # UI do CMS (React)
│   ├── auth/             # NextAuth config
│   └── manifest.ts       # Catalogo tipado de queries
│
├── sdk/                  # @medicinal/sdk
│   ├── client.ts         # Fetch wrapper tipado
│   ├── hooks/
│   │   ├── usePost.ts
│   │   ├── useProducts.ts
│   │   ├── useCategories.ts
│   │   ├── useSettings.ts
│   │   └── useSearch.ts
│   └── index.ts
│
└── frontend/             # @medicinal/frontend (ou qualquer framework)
    └── ...               # Consome apenas @medicinal/sdk
```

### Manifest

O manifest e o contrato entre CMS e frontend. Define todas as queries disponiveis com tipos de entrada e saida.

```ts
// packages/cms/manifest.ts

import type {
  Post, PostListParams, PostListResponse,
  Product, ProductListParams, ProductListResponse,
  Category,
  Author,
  SiteSettings,
  Page,
  SearchResult, SearchParams,
} from "@medicinal/types";

export type Manifest = {
  "posts/list": {
    params: PostListParams;
    response: PostListResponse;
  };
  "posts/get": {
    params: { slug: string };
    response: Post;
  };
  "posts/related": {
    params: { slug: string; limit?: number };
    response: Post[];
  };
  "products/list": {
    params: ProductListParams;
    response: ProductListResponse;
  };
  "products/get": {
    params: { slug: string };
    response: Product;
  };
  "products/by-category": {
    params: { categorySlug: string; page?: number };
    response: ProductListResponse;
  };
  "categories/list": {
    params: void;
    response: Category[];
  };
  "categories/get": {
    params: { slug: string };
    response: Category;
  };
  "authors/get": {
    params: { slug: string };
    response: Author;
  };
  "settings/get": {
    params: void;
    response: SiteSettings;
  };
  "pages/get": {
    params: { slug: string };
    response: Page;
  };
  "search": {
    params: SearchParams;
    response: SearchResult;
  };
};
```

### SDK — Client

Fetch wrapper tipado que conhece o manifest.

```ts
// packages/sdk/client.ts

import type { Manifest } from "@medicinal/cms/manifest";

type QueryKey = keyof Manifest;

type Config = {
  baseUrl: string;
  token?: string;
};

export function createClient(config: Config) {
  async function query<K extends QueryKey>(
    key: K,
    ...args: Manifest[K]["params"] extends void ? [] : [Manifest[K]["params"]]
  ): Promise<Manifest[K]["response"]> {
    const params = args[0];
    const url = new URL(`/api/content/${key}`, config.baseUrl);

    if (params && typeof params === "object") {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url.toString(), {
      headers: config.token ? { Authorization: `Bearer ${config.token}` } : {},
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Query ${key} failed: ${res.status}`);
    return res.json();
  }

  return { query };
}
```

### SDK — Hooks

Hooks tipados que o frontend usa. Mesmo pattern que `useProduct` no VTEX IO.

```ts
// packages/sdk/hooks/usePost.ts

import { createClient } from "../client";
import type { Post } from "@medicinal/types";

const client = createClient({
  baseUrl: process.env.NEXT_PUBLIC_CMS_URL || "",
});

// Server Component (RSC) — fetch direto
export async function getPost(slug: string): Promise<Post> {
  return client.query("posts/get", { slug });
}

// Client Component — hook com state
export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.query("posts/get", { slug })
      .then(setPost)
      .finally(() => setLoading(false));
  }, [slug]);

  return { post, loading };
}
```

```ts
// packages/sdk/hooks/useProducts.ts

export async function getProducts(params: ProductListParams): Promise<ProductListResponse> {
  return client.query("products/list", params);
}

export async function getProductsByCategory(categorySlug: string, page = 1) {
  return client.query("products/by-category", { categorySlug, page });
}
```

### Uso no frontend

```tsx
// Antes (acoplado — query Drizzle direto)
import { getPublishedPost } from "@/lib/queries";
const post = await getPublishedPost(slug);

// Depois (desacoplado — SDK)
import { getPost } from "@medicinal/sdk";
const post = await getPost(slug);
```

```tsx
// Antes
import { getProductsByCategory } from "@/lib/queries";
const { products, total } = await getProductsByCategory(slug, page);

// Depois
import { getProductsByCategory } from "@medicinal/sdk";
const { docs, totalPages } = await getProductsByCategory(slug, page);
```

A assinatura muda minimamente. O frontend nao sabe se por tras tem Drizzle, Prisma, Supabase ou GraphQL.

---

## API publica (camada de dados)

Endpoints que o SDK consome. Separados dos endpoints admin.

```
/api/content/
├── posts/list          GET ?page=1&limit=10&category=saude&status=published
├── posts/get           GET ?slug=meu-post
├── posts/related       GET ?slug=meu-post&limit=3
├── products/list       GET ?page=1&limit=12&category=fit
├── products/get        GET ?slug=meu-produto
├── products/by-category GET ?categorySlug=emagrecedor&page=1
├── categories/list     GET
├── categories/get      GET ?slug=saude
├── authors/get         GET ?slug=dr-joao
├── settings/get        GET
├── pages/get           GET ?slug=politica-de-privacidade
└── search              GET ?q=vitamina&limit=10
```

Todos retornam apenas dados publicados (`status = 'published'`). Sem auth necessaria. Cache `stale-while-revalidate` com revalidacao por tag.

---

## Draft/Publish flow

O CMS usa um modelo draft/publish por pagina.

```
Edicao → salva em `draft` (JSON) → review em /admin/publicar → publish copia draft → content
                                                              → discard apaga draft
```

- `draft` != null = tem alteracoes pendentes (staging)
- Ao publicar: campos do draft substituem os campos publicados, draft vira null
- Ao descartar: draft vira null, campos publicados ficam intactos
- Publicacao em lote: `POST /api/admin/pages/publish-batch { ids: [1, 2, 3] }`
- Descarte em lote: `POST /api/admin/pages/discard-batch { ids: [1, 2, 3] }`

---

## Por que nao GraphQL (por enquanto)

| Criterio | REST + Manifest | GraphQL |
|----------|----------------|---------|
| Entidades | 10 — REST da conta | GraphQL brilha com 50+ |
| Frontends | 1 (Next.js) | Justifica com 2+ (web + app) |
| Complexidade | Manifest + hooks = ~200 LOC | Schema + resolvers + client = ~800 LOC |
| Cache | Cache-Control + revalidateTag | Precisa de normalized cache (Apollo/urql) |
| DX | `usePost(slug)` | `useQuery(GET_POST, { variables: { slug } })` |
| Flexibilidade | Frontend recebe shape fixo | Frontend pede exatamente o que precisa |
| Migracao futura | Troca o client.ts, hooks nao mudam | — |

Se no futuro o CMS servir multiplos frontends (app mobile, outro site), GraphQL passa a fazer sentido. A migracao seria trocar apenas `packages/sdk/client.ts` — os hooks e o manifest continuam iguais.

---

## Plano de migracao

### Fase 1 — API publica (sem quebrar nada)
- Criar `/api/content/*` endpoints (leitura publica, cache, sem auth)
- Manter `queries.ts` funcionando em paralelo

### Fase 2 — Extrair types
- Criar `packages/types/` com todos os tipos exportados
- CMS e frontend importam de `@medicinal/types`

### Fase 3 — SDK + hooks
- Criar `packages/sdk/` com client + hooks
- Frontend troca imports de `queries.ts` por hooks do SDK
- Deletar `lib/queries.ts`

### Fase 4 — Separar deploys (opcional)
- CMS vira app independente (Next.js ou Fastify)
- Frontend consome via SDK apontando pra URL do CMS
- Cada um com seu deploy, CI/CD e dominio

Cada fase e independente e nao quebra o que existe. Pode parar em qualquer fase.

---

## Stack de referencia

| Camada | Tecnologia atual | Apos desacoplamento |
|--------|-----------------|-------------------|
| CMS API | Next.js API Routes + Drizzle | Mesmo (ou Fastify standalone) |
| CMS Admin | Next.js App Router (admin/) | Mesmo |
| Tipos | Inline nos arquivos | `@medicinal/types` (pacote compartilhado) |
| Frontend data | `lib/queries.ts` (Drizzle direto) | `@medicinal/sdk` (hooks tipados) |
| Transporte | Import direto (server-side) | REST `/api/content/*` |
| Cache | `unstable_cache` + tags | `Cache-Control` + `revalidateTag` |
| Auth (admin) | NextAuth v5 | Mesmo, isolado no CMS |

---

## Multi-tenancy e White-label

### Objetivo

Transformar o CMS em produto reutilizavel da WaveCommerce. Cada cliente recebe uma instancia do CMS com branding proprio, banco isolado e dominio customizado. O admin e forkavel por projeto ou compartilhado via multi-tenancy.

### Estrategias de isolamento

| Estrategia | Isolamento | Complexidade | Custo Neon | Quando usar |
|-----------|-----------|-------------|-----------|------------|
| **DB por tenant** (1 Neon project cada) | Total | Baixa | Alto (~$19/projeto) | 1-5 clientes, agency deploy manual |
| **Schema por tenant** (1 Neon, N schemas) | Alto | Media | Medio (1 projeto) | 5-50 clientes, melhor custo-beneficio |
| **Shared tables + tenant_id** | Baixo (depende de RLS) | Alta | Baixo (1 projeto, 1 schema) | SaaS 100+ clientes com self-signup |

### Recomendacao: schema por tenant

Um unico Neon project. Cada cliente recebe seu proprio PostgreSQL schema com as mesmas 11 tabelas. Isolamento forte sem custo extra por cliente.

```
Neon Project: wavecommerce-cms
├── public              # Tabela tenants (compartilhada)
├── tenant_medicinal    # 11 tabelas do cliente Medicinal
├── tenant_loja_x       # 11 tabelas do cliente Loja X
└── tenant_farmacia_y   # 11 tabelas do cliente Farmacia Y
```

### Tabela de tenants (schema public)

Tabela compartilhada que mapeia dominios para schemas e armazena configuracoes do tenant.

```sql
CREATE TABLE public.tenants (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,              -- "Medicinal na Web"
  slug        VARCHAR(100) NOT NULL UNIQUE,        -- "medicinal"
  domain      VARCHAR(255) UNIQUE,                 -- "medicinal.com.br"
  subdomain   VARCHAR(100) UNIQUE,                 -- "medicinal" (.wavecommerce.com.br)
  schema_name VARCHAR(100) NOT NULL UNIQUE,        -- "tenant_medicinal"

  -- Branding
  logo_url      TEXT,
  favicon_url   TEXT,
  primary_color VARCHAR(7) DEFAULT '#0d61ac',
  brand_name    VARCHAR(255) DEFAULT 'WaveCommerce',

  -- Subscription
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, trial, suspended
  plan                VARCHAR(50) DEFAULT 'starter', -- starter, pro, enterprise
  trial_ends_at       TIMESTAMP,

  -- Limits
  max_posts     INTEGER DEFAULT 100,
  max_products  INTEGER DEFAULT 200,
  max_media_mb  INTEGER DEFAULT 500,

  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Resolucao do tenant

O middleware resolve o tenant pelo dominio ou subdomain do request.

```ts
// middleware.ts

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq, or } from "drizzle-orm";

async function resolveTenant(host: string) {
  // Remove porta
  const domain = host.split(":")[0];

  // Tenta dominio customizado primeiro, depois subdomain
  const subdomain = domain.split(".")[0];

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(
      or(
        eq(tenants.domain, domain),
        eq(tenants.subdomain, subdomain),
      )
    )
    .limit(1);

  return tenant ?? null;
}

// No middleware do Next.js:
export default auth(async (req) => {
  const host = req.headers.get("host") ?? "";
  const tenant = await resolveTenant(host);

  if (!tenant) {
    return new Response("Tenant nao encontrado", { status: 404 });
  }

  if (tenant.subscription_status === "suspended") {
    return Response.redirect(new URL("/admin/pagamento-pendente", req.nextUrl.origin));
  }

  // Injeta tenant no header pra uso nas API routes
  req.headers.set("x-tenant-id", String(tenant.id));
  req.headers.set("x-tenant-schema", tenant.schema_name);

  // ... resto da logica de auth
});
```

### Drizzle com schema dinamico

```ts
// db/client.ts

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const client = neon(process.env.DATABASE_URL!);
const baseDb = drizzle(client, { schema });

export function getDb(tenantSchema: string) {
  return {
    ...baseDb,
    // Seta o search_path pro schema do tenant
    async withTenant<T>(fn: (db: typeof baseDb) => Promise<T>): Promise<T> {
      await baseDb.execute(sql.raw(`SET search_path TO ${tenantSchema}, public`));
      return fn(baseDb);
    },
  };
}

// Uso em API routes:
export function getTenantDb(request: Request) {
  const schema = request.headers.get("x-tenant-schema");
  if (!schema) throw new Error("Tenant nao resolvido");
  return getDb(schema);
}
```

```ts
// Exemplo de uso em um endpoint
import { getTenantDb } from "@/db/client";

export async function GET(req: NextRequest) {
  const db = getTenantDb(req);

  const posts = await db.withTenant(async (db) => {
    return db.select().from(posts).where(eq(posts.status, "published"));
  });

  return NextResponse.json(posts);
}
```

### Provisioning de novo tenant

Script ou endpoint admin que cria o schema e roda migrations pra um novo cliente.

```ts
// scripts/create-tenant.ts

import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function createTenant(slug: string, name: string, domain?: string) {
  const schemaName = `tenant_${slug}`;

  // 1. Criar schema
  await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`));

  // 2. Rodar migrations no schema novo
  await db.execute(sql.raw(`SET search_path TO ${schemaName}`));
  await migrate(db, { migrationsFolder: "./drizzle" });

  // 3. Registrar na tabela de tenants
  await db.execute(sql`
    INSERT INTO public.tenants (name, slug, schema_name, domain)
    VALUES (${name}, ${slug}, ${schemaName}, ${domain})
  `);

  // 4. Seed com dados iniciais (site_settings, admin user)
  await db.execute(sql.raw(`SET search_path TO ${schemaName}`));
  await db.execute(sql`
    INSERT INTO site_settings (id, site_name) VALUES (1, ${name})
  `);

  console.log(`Tenant ${slug} criado com schema ${schemaName}`);
}
```

### Assets por tenant

Imagens e uploads isolados por tenant usando prefixo no Vercel Blob (ou Cloudflare R2).

```ts
// lib/upload.ts

import { put } from "@vercel/blob";

export async function uploadMedia(
  file: File,
  tenantSlug: string,
) {
  const path = `${tenantSlug}/${Date.now()}-${file.name}`;

  const blob = await put(path, file, {
    access: "public",
  });

  return blob.url;
}
```

Estrutura no blob storage:

```
uploads/
├── medicinal/
│   ├── 1716000000-hero.webp
│   └── 1716000001-product.webp
├── loja-x/
│   ├── 1716000100-banner.webp
│   └── 1716000101-logo.png
└── farmacia-y/
    └── ...
```

### White-label

O CMS carrega branding do tenant em tempo de execucao. Nenhum branding e hardcoded.

**Tela de login:**

```tsx
// app/(admin)/admin/login/page.tsx

export default async function LoginPage() {
  const tenant = await getCurrentTenant(); // do header ou cookie

  return (
    <div style={{ "--primary": tenant.primary_color } as React.CSSProperties}>
      <img src={tenant.logo_url} alt={tenant.brand_name} />
      <h1>Entrar em {tenant.name}</h1>
      {/* form de login */}
    </div>
  );
}
```

**CSS variables por tenant:**

```css
:root {
  --primary: var(--tenant-primary, #0d61ac);
  --primary-hover: color-mix(in srgb, var(--primary) 85%, black);
}
```

O admin inteiro usa `var(--primary)` em vez de `#0d61ac` hardcoded. Ao carregar o tenant, o middleware injeta a cor via header e o layout seta a CSS variable.

**Dominio customizado:**

```
Vercel → dominio default: {slug}.wavecommerce.com.br
       → dominio custom:  cms.medicinal.com.br (CNAME → cname.vercel-dns.com)
```

Configuravel via Vercel API ou dashboard. A tabela `tenants.domain` armazena o dominio custom pra resolucao no middleware.

### O que ja esta pronto vs o que falta

| Item | Status | Esforco |
|------|--------|---------|
| Schema generico (11 tabelas) | Pronto | — |
| `site_settings` com branding dinamico | Pronto | — |
| Subscription/billing (Stripe) | Pronto | — |
| Auth (NextAuth) | Pronto | — |
| Componentes admin isolados | Pronto | — |
| Draft/publish flow | Pronto | — |
| Tabela `tenants` | Falta | 1h |
| Middleware tenant resolution | Falta | 2h |
| Drizzle schema dinamico | Falta | 3h |
| Script de provisioning | Falta | 2h |
| Trocar `#0d61ac` hardcoded por CSS var | Falta | 2h |
| Upload com prefixo tenant | Falta | 1h |
| Dominio customizado (Vercel API) | Falta | 2h |
| Drizzle migrations configuradas | Falta | 2h |

**Total estimado: ~15h de trabalho** pra ter multi-tenancy funcionando com o primeiro tenant migrado.

### Regras de ouro (aplicar desde ja)

1. **Nunca hardcodar** cores, nomes ou URLs do cliente — tudo vem de `site_settings` ou `tenants`
2. **Manter o schema generico** — as 11 tabelas servem pra qualquer blog/catalogo
3. **Migrations obrigatorias** — sem migrations, nao da pra replicar schema pra novos tenants
4. **Assets com namespace** — todo upload tem prefixo do tenant
5. **Variavel de ambiente unica** — `DATABASE_URL` aponta pro Neon project, o schema e resolvido em runtime
