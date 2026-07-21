/**
 * Brasa CMS — Typed SDK
 *
 * Replaces all direct database queries. The frontend consumes the CMS API
 * through this client, with built-in Next.js caching via `next: { revalidate }`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SectionBlock = {
  id: string;
  component: string;
  props: Record<string, unknown>;
  loaderData?: unknown;
  deferred?: boolean;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverUrl: string | null;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  secondaryKeywords: string | null;
  seoScore: number | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  schemaType: string | null;
  canonicalUrl: string | null;
  wordCount: number | null;
  noindex: boolean | null;
  nofollow: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  category: { id: number; name: string; slug: string } | null;
  author: {
    id: number;
    name: string;
    slug: string;
    bio: string | null;
    avatar: { url: string } | null;
  } | null;
  heroImage: {
    url: string | null;
    alt: string | null;
    sizes?: {
      thumbnail?: { url: string | null };
      card?: { url: string | null };
      hero?: { url: string | null };
    };
  } | null;
  tags: { tag: string }[];
};

/** Post without content — returned by list endpoints */
export type PostListItem = Omit<
  Post,
  | "content"
  | "metaTitle"
  | "metaDescription"
  | "focusKeyword"
  | "ogTitle"
  | "ogDescription"
  | "ogImageUrl"
  | "schemaType"
  | "canonicalUrl"
  | "wordCount"
  | "noindex"
  | "nofollow"
  | "createdAt"
  | "updatedAt"
>;

export type PaginatedResult<T> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  postCount?: number;
};

export type Author = {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: { url: string } | null;
};

export type AuthorWithPosts = {
  author: Author;
  docs: PostListItem[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type SiteSettings = {
  siteName: string | null;
  siteDescription: string | null;
  logo: { url: string; alt: string | null } | null;
  favicon: { url: string } | null;
  whatsapp: string | null;
  social: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  newsletter: {
    title: string | null;
    description: string | null;
    consent: string | null;
  };
  seo: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  footerText: string | null;
  copyrightText: string | null;
  analytics: {
    umamiWebsiteId: string | null;
    umamiUrl: string | null;
    gtmId: string | null;
    ga4Id: string | null;
    googleAdsId: string | null;
    facebookPixelId: string | null;
  };
  scripts: {
    head: string | null;
    body: string | null;
  };
};

export type CmsPage = {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  sections: SectionBlock[] | null;
  draftSections: SectionBlock[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  isKit: boolean | null;
  featured: boolean | null;
  publishedAt: string | null;
  category: { id: number; name: string; slug: string } | null;
  image: { url: string; alt: string | null; thumbnailUrl: string | null } | null;
};

export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number | null;
  image: { url: string; alt: string | null; thumbnailUrl: string | null } | null;
};

// ---------------------------------------------------------------------------
// Revalidation constants (seconds)
// ---------------------------------------------------------------------------

const REVALIDATE = {
  POSTS_LIST: 60,
  POST_SINGLE: 60,
  CATEGORIES: 60,
  SETTINGS: 300,
  PAGES: 60,
  PAGES_DRAFT: 0,
  PRODUCTS: 60,
  AUTHORS: 60,
} as const;

// ---------------------------------------------------------------------------
// Supabase PostgREST fallback (when CMS individual endpoints are down)
// ---------------------------------------------------------------------------

function createSupabaseFallback() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabaseKey) return null;

  async function query<T>(table: string, params: string): Promise<T | null> {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  return {
    async getPostBySlug(slug: string): Promise<Post | null> {
      type Row = Record<string, unknown> & { categories?: { id: string; name: string; slug: string } | null };
      const rows = await query<Row[]>(
        "articles",
        `slug=eq.${encodeURIComponent(slug)}&select=*,categories(id,name,slug)&limit=1`,
      );
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      const publishedAt = (r.published_date as string) || (r.published_at as string) || null;
      return {
        id: r.id as number,
        title: r.title as string,
        slug: r.slug as string,
        excerpt: (r.excerpt as string) || null,
        content: (r.content as string) || null,
        coverUrl: (r.cover_image_url as string) || null,
        status: (r.status as string) || "published",
        featured: (r.featured as boolean) || false,
        publishedAt: publishedAt ? `${publishedAt}`.replace(/T.*/, " 00:00:00") : null,
        readingTimeMinutes: (r.reading_time_minutes as number) || null,
        metaTitle: (r.meta_title as string) || null,
        metaDescription: (r.meta_description as string) || null,
        focusKeyword: (r.focus_keyword as string) || null,
        secondaryKeywords: (r.secondary_keywords as string) || null,
        seoScore: (r.seo_score as number) || null,
        ogTitle: (r.og_title as string) || null,
        ogDescription: (r.og_description as string) || null,
        ogImageUrl: (r.og_image_url as string) || null,
        schemaType: (r.schema_type as string) || null,
        canonicalUrl: (r.canonical_url as string) || null,
        wordCount: (r.word_count as number) || null,
        noindex: null,
        nofollow: null,
        createdAt: (r.created_at as string) || null,
        updatedAt: (r.updated_at as string) || null,
        category: r.categories
          ? { id: r.categories.id as unknown as number, name: r.categories.name, slug: r.categories.slug }
          : null,
        author: r.author_name
          ? { id: 0, name: r.author_name as string, slug: "", bio: null, avatar: null }
          : null,
        heroImage: (r.cover_image_url as string)
          ? {
              url: r.cover_image_url as string,
              alt: (r.cover_image_alt as string) || null,
              sizes: {
                thumbnail: { url: r.cover_image_url as string },
                card: { url: r.cover_image_url as string },
                hero: { url: r.cover_image_url as string },
              },
            }
          : null,
        tags: [],
      };
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
      type Row = Record<string, unknown>;
      const rows = await query<Row[]>(
        "products",
        `slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
      );
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      const product: Product & Record<string, unknown> = {
        id: r.id as number,
        name: (r.title as string) || "",
        slug: r.slug as string,
        description: (r.excerpt as string) || null,
        brand: null,
        isKit: null,
        featured: null,
        publishedAt: (r.published_at as string) || null,
        category: null,
        image: (r.cover_image_url as string)
          ? { url: r.cover_image_url as string, alt: (r.cover_image_alt as string) || null, thumbnailUrl: null }
          : null,
        // Extended fields used by product detail page
        content: (r.content as string) ? { _html: r.content as string } : null,
        faq: r.faq || [],
        embalagem_mockup: r.embalagem_mockup || null,
        redirect_to: r.redirect_to || null,
      };
      return product;
    },
  };
}

// ---------------------------------------------------------------------------
// Client factory
// ---------------------------------------------------------------------------

function createClient() {
  const baseUrl = (process.env.CMS_URL || "https://cms.brasa.tech").replace(
    /\/$/,
    "",
  );
  const apiKey = process.env.CMS_API_KEY || "";
  const previewSecret = process.env.CMS_PREVIEW_SECRET || "";
  const fallback = createSupabaseFallback();

  async function request<T>(
    path: string,
    opts?: {
      revalidate?: number;
      draft?: boolean;
      params?: Record<string, string | number | boolean | undefined>;
    },
  ): Promise<T | null> {
    const { revalidate = 300, draft = false, params } = opts ?? {};

    const url = new URL(`/api/v1${path}`, baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    if (draft) {
      url.searchParams.set("draft", "true");
    }

    const headers: Record<string, string> = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    };

    if (draft && previewSecret) {
      headers["x-preview-secret"] = previewSecret;
    }

    try {
      const tag = path.split("/")[1] || "cms";
      const res = await fetch(url.toString(), {
        headers,
        next: {
          revalidate: draft ? 0 : revalidate,
          tags: [tag],
        },
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        console.error(
          `[cms] ${res.status} ${res.statusText} — ${url.pathname}`,
        );
        return null;
      }

      return (await res.json()) as T;
    } catch (error) {
      console.error(`[cms] Fetch failed — ${url.pathname}`, error);
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // Posts
  // -------------------------------------------------------------------------

  const posts = {
    async list(
      opts?: {
        limit?: number;
        page?: number;
        category?: string;
        author?: number | string;
        featured?: boolean;
        homeSection?: string;
        search?: string;
        draft?: boolean;
      },
    ): Promise<PaginatedResult<PostListItem>> {
      const { limit = 10, page = 1, category, author, featured, homeSection, search, draft } =
        opts ?? {};

      const result = await request<PaginatedResult<PostListItem>>("/posts", {
        revalidate: REVALIDATE.POSTS_LIST,
        draft,
        params: {
          limit: limit,
          page: page,
          category,
          author: author !== undefined ? author : undefined,
          featured: featured ? "true" : undefined,
          homeSection,
          search,
        },
      });

      return (
        result ?? {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page,
          limit,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    },

    async getBySlug(
      slug: string,
      opts?: { draft?: boolean },
    ): Promise<Post | null> {
      const result = await request<Post>(`/posts/${encodeURIComponent(slug)}`, {
        revalidate: REVALIDATE.POST_SINGLE,
        draft: opts?.draft,
      });
      if (result) return result;
      // Fallback: query Supabase directly
      return fallback?.getPostBySlug(slug) ?? null;
    },

    async featured(opts?: { draft?: boolean }): Promise<PostListItem | null> {
      return request<PostListItem>("/posts/featured", {
        revalidate: REVALIDATE.POSTS_LIST,
        draft: opts?.draft,
      });
    },
  };

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------

  const categories = {
    async list(
      opts?: { withCount?: boolean },
    ): Promise<{ docs: Category[] }> {
      const result = await request<{ docs: Category[] }>("/categories", {
        revalidate: REVALIDATE.CATEGORIES,
      });

      return result ?? { docs: [] };
    },

    async getBySlug(slug: string): Promise<Category | null> {
      return request<Category>(`/categories/${encodeURIComponent(slug)}`, {
        revalidate: REVALIDATE.CATEGORIES,
      });
    },
  };

  // -------------------------------------------------------------------------
  // Authors
  // -------------------------------------------------------------------------

  const authors = {
    async getBySlug(
      slug: string,
      opts?: { limit?: number; page?: number },
    ): Promise<AuthorWithPosts | null> {
      const { limit = 12, page = 1 } = opts ?? {};

      return request<AuthorWithPosts>(
        `/authors/${encodeURIComponent(slug)}`,
        {
          revalidate: REVALIDATE.AUTHORS,
          params: { limit, page },
        },
      );
    },
  };

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------

  const settings = {
    async get(): Promise<SiteSettings> {
      const result = await request<SiteSettings>("/settings", {
        revalidate: REVALIDATE.SETTINGS,
      });

      return (
        result ?? {
          siteName: null,
          siteDescription: null,
          logo: null,
          favicon: null,
          whatsapp: null,
          social: { facebook: null, instagram: null, youtube: null },
          newsletter: { title: null, description: null, consent: null },
          seo: { title: null, description: null, keywords: null },
          footerText: null,
          copyrightText: null,
          analytics: {
            umamiWebsiteId: null,
            umamiUrl: null,
            gtmId: null,
            ga4Id: null,
            googleAdsId: null,
            facebookPixelId: null,
          },
          scripts: { head: null, body: null },
        }
      );
    },
  };

  // -------------------------------------------------------------------------
  // Pages
  // -------------------------------------------------------------------------

  const pages = {
    async get(
      slug: string,
      opts?: { draft?: boolean },
    ): Promise<CmsPage | null> {
      const draft = opts?.draft ?? false;
      return request<CmsPage>(`/pages/${encodeURIComponent(slug)}`, {
        revalidate: draft ? REVALIDATE.PAGES_DRAFT : REVALIDATE.PAGES,
        draft,
      });
    },
  };

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------

  const products = {
    async list(
      opts?: {
        limit?: number;
        offset?: number;
        category?: number;
        featured?: boolean;
        search?: string;
      },
    ): Promise<{ docs: Product[] }> {
      const { limit = 20, offset = 0, category, featured, search } = opts ?? {};

      const result = await request<{ docs: Product[] }>("/products", {
        revalidate: search ? 0 : REVALIDATE.PRODUCTS,
        params: {
          limit,
          offset,
          category: category !== undefined ? category : undefined,
          featured: featured ? "true" : undefined,
          search,
        },
      });

      return result ?? { docs: [] };
    },

    async getBySlug(slug: string): Promise<Product | null> {
      const result = await request<Product>(`/products/${encodeURIComponent(slug)}`, {
        revalidate: REVALIDATE.PRODUCTS,
      });
      if (result) return result;
      // Fallback: query Supabase directly
      return fallback?.getProductBySlug(slug) ?? null;
    },
  };

  // -------------------------------------------------------------------------
  // Product Categories
  // -------------------------------------------------------------------------

  const productCategories = {
    async list(): Promise<{ docs: ProductCategory[] }> {
      const result = await request<{ docs: ProductCategory[] }>(
        "/product-categories",
        { revalidate: REVALIDATE.CATEGORIES },
      );

      return result ?? { docs: [] };
    },
  };

  // -------------------------------------------------------------------------
  // Collections (generic)
  // -------------------------------------------------------------------------

  const collections = {
    async list(
      slug: string,
      opts?: { limit?: number; offset?: number },
    ): Promise<{ docs: { id: number; slug: string; status: string; data: Record<string, unknown> }[] }> {
      const { limit = 50, offset = 0 } = opts ?? {};
      const result = await request<{
        docs: { id: number; slug: string; status: string; data: Record<string, unknown> }[];
      }>(`/collections/${encodeURIComponent(slug)}`, {
        revalidate: REVALIDATE.CATEGORIES,
        params: { limit, offset },
      });
      return result ?? { docs: [] };
    },
  };

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  return {
    posts,
    categories,
    authors,
    settings,
    pages,
    products,
    productCategories,
    collections,
  };
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const cms = createClient();
