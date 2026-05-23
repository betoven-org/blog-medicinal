import { unstable_cache } from "next/cache";
import { db } from "@brasa/core/db";
import {
  posts,
  categories,
  authors,
  media,
  tags,
  siteSettings,
  pages,
} from "@brasa/core/schema";
import { eq, and, ne, desc, asc, ilike, or, count, sql } from "drizzle-orm";

// ── Helpers ─────────────────────────────────────────────────────────────────────

type MediaRow = typeof media.$inferSelect;

function mapMedia(m: MediaRow | null | undefined) {
  if (!m) return null;
  return {
    id: m.id,
    url: m.url,
    alt: m.alt,
    sizes: {
      thumbnail: { url: m.thumbnailUrl },
      card: { url: m.cardUrl },
      hero: { url: m.heroUrl },
    },
  };
}

function mapPost(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverUrl: row.coverUrl,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    focusKeyword: row.focusKeyword,
    secondaryKeywords: row.secondaryKeywords,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    ogImageUrl: row.ogImageUrl,
    schemaType: row.schemaType,
    canonicalUrl: row.canonicalUrl,
    wordCount: row.wordCount,
    readingTimeMinutes: row.readingTimeMinutes,
    seoScore: row.seoScore,
    noindex: row.noindex,
    nofollow: row.nofollow,
    status: row.status,
    featured: row.featured,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.category ?? row.categoryId,
    author: row.author
      ? {
          id: row.author.id,
          name: row.author.name,
          slug: row.author.slug,
          bio: row.author.bio,
          avatar: row.author.avatar
            ? { url: row.author.avatar.url }
            : null,
        }
      : row.authorId,
    heroImage: mapMedia(row.heroImage),
    tags: (row.tags ?? []).map((t: any) => ({ tag: t.tag })),
  };
}

// ── Queries ─────────────────────────────────────────────────────────────────────

export const getSiteSettings = unstable_cache(
  async () => {
    const row = await db.query.siteSettings.findFirst({
      with: {
        logo: true,
        favicon: true,
      },
    });
    if (!row) {
      return {
        id: 0,
        siteName: "Medicinal na Web",
        siteDescription: null,
        logoId: null,
        faviconId: null,
        whatsapp: null,
        facebook: null,
        instagram: null,
        youtube: null,
        footerText: null,
        copyrightText: null,
        newsletterTitle: null,
        newsletterDescription: null,
        newsletterConsent: null,
        seoTitle: null,
        seoDescription: null,
        seoKeywords: null,
        privacyPolicy: null,
        robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api",
        supabaseUrl: null,
        supabaseAnonKey: null,
        supabaseServiceRoleKey: null,
        umamiWebsiteId: null,
        umamiUrl: null,
        supabaseSyncEnabled: false,
        lastSyncAt: null,
        updatedAt: new Date().toISOString(),
        logo: null,
        favicon: null,
      };
    }
    return {
      ...row,
      logo: mapMedia(row.logo),
      favicon: mapMedia(row.favicon),
    };
  },
  ["site-settings"],
  { revalidate: 3600, tags: ["settings"] },
);

export const getFeaturedPost = unstable_cache(
  async () => {
    const rows = await db.query.posts.findMany({
      where: and(
        eq(posts.status, "published"),
        eq(posts.featured, true),
      ),
      orderBy: [desc(posts.publishedAt)],
      limit: 1,
      with: {
        category: true,
        author: { with: { avatar: true } },
        heroImage: true,
        tags: true,
      },
    });
    if (!rows[0]) return null;
    return mapPost(rows[0]);
  },
  ["featured-post"],
  { revalidate: 300, tags: ["posts"] },
);

export async function getLatestPosts(limit = 9, page = 1) {
  return unstable_cache(
    async () => {
      const offset = (page - 1) * limit;

      const whereCondition = eq(posts.status, "published");

      const [{ total }] = await db
        .select({ total: count() })
        .from(posts)
        .where(whereCondition);

      const rows = await db.query.posts.findMany({
        where: whereCondition,
        orderBy: [desc(posts.publishedAt)],
        limit,
        offset,
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });

      const totalDocs = total;
      const totalPages = Math.ceil(totalDocs / limit);

      return {
        docs: rows.map(mapPost),
        totalDocs,
        totalPages,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    },
    ["latest-posts", String(limit), String(page)],
    { revalidate: 300, tags: ["posts"] },
  )();
}

export const getRecentPosts = unstable_cache(
  async (limit = 5) => {
    const rows = await db.query.posts.findMany({
      where: eq(posts.status, "published"),
      orderBy: [desc(posts.createdAt)],
      limit,
      with: {
        category: true,
        author: { with: { avatar: true } },
        heroImage: true,
        tags: true,
      },
    });

    return { docs: rows.map(mapPost) };
  },
  ["recent-posts"],
  { revalidate: 300, tags: ["posts"] },
);

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const row = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });
      if (!row) return null;
      return mapPost(row);
    },
    ["post-by-slug", slug],
    { revalidate: 600, tags: ["posts"] },
  )();
}

export async function getPostsByCategory(
  categorySlug: string,
  limit = 12,
  page = 1,
) {
  return unstable_cache(
    async () => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });

      if (!category)
        return { docs: [], category: null, totalPages: 0, totalDocs: 0 };

      const whereCondition = and(
        eq(posts.status, "published"),
        eq(posts.categoryId, category.id),
      );

      const [{ total }] = await db
        .select({ total: count() })
        .from(posts)
        .where(whereCondition);

      const offset = (page - 1) * limit;

      const rows = await db.query.posts.findMany({
        where: whereCondition,
        orderBy: [desc(posts.publishedAt)],
        limit,
        offset,
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });

      const totalDocs = total;
      const totalPages = Math.ceil(totalDocs / limit);

      return {
        docs: rows.map(mapPost),
        category,
        totalPages,
        totalDocs,
      };
    },
    ["posts-by-category", categorySlug, String(limit), String(page)],
    { revalidate: 300, tags: ["posts", "categories"] },
  )();
}

export async function getPostsByCategorySlug(
  categorySlug: string,
  limit = 6,
) {
  return unstable_cache(
    async () => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });

      if (!category) return { docs: [] };

      const rows = await db.query.posts.findMany({
        where: and(
          eq(posts.status, "published"),
          eq(posts.categoryId, category.id),
        ),
        orderBy: [desc(posts.publishedAt)],
        limit,
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });

      return { docs: rows.map(mapPost) };
    },
    ["posts-by-cat-slug", categorySlug, String(limit)],
    { revalidate: 300, tags: ["posts"] },
  )();
}

export async function getRelatedPosts(
  categoryId: string | number,
  excludePostId: string | number,
  limit = 3,
) {
  return unstable_cache(
    async () => {
      const rows = await db.query.posts.findMany({
        where: and(
          eq(posts.status, "published"),
          eq(posts.categoryId, Number(categoryId)),
          ne(posts.id, Number(excludePostId)),
        ),
        orderBy: [desc(posts.publishedAt)],
        limit,
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });

      return {
        docs: rows.map(mapPost),
        totalDocs: rows.length,
        totalPages: 1,
      };
    },
    ["related-posts", String(categoryId), String(excludePostId)],
    { revalidate: 300, tags: ["posts"] },
  )();
}

export async function searchPosts(
  query: string,
  categorySlug?: string,
  limit = 12,
  page = 1,
) {
  return unstable_cache(
    async () => {
      const searchPattern = `%${query}%`;
      const conditions = [
        eq(posts.status, "published"),
        or(
          ilike(posts.title, searchPattern),
          ilike(posts.excerpt, searchPattern),
        )!,
      ];

      if (categorySlug) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
        });
        if (category) {
          conditions.push(eq(posts.categoryId, category.id));
        }
      }

      const whereCondition = and(...conditions);
      const offset = (page - 1) * limit;

      const [{ total }] = await db
        .select({ total: count() })
        .from(posts)
        .where(whereCondition);

      const rows = await db.query.posts.findMany({
        where: whereCondition,
        orderBy: [desc(posts.publishedAt)],
        limit,
        offset,
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });

      const totalDocs = total;
      const totalPages = Math.ceil(totalDocs / limit);

      return {
        docs: rows.map(mapPost),
        totalDocs,
        totalPages,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    },
    ["search-posts", query, categorySlug ?? "", String(limit), String(page)],
    { revalidate: 120, tags: ["posts"] },
  )();
}

export async function getPostsByAuthor(
  authorId: string | number,
  limit = 12,
  page = 1,
) {
  return unstable_cache(
    async () => {
      const whereCondition = and(
        eq(posts.status, "published"),
        eq(posts.authorId, Number(authorId)),
      );

      const offset = (page - 1) * limit;

      const [{ total }] = await db
        .select({ total: count() })
        .from(posts)
        .where(whereCondition);

      const rows = await db.query.posts.findMany({
        where: whereCondition,
        orderBy: [desc(posts.publishedAt)],
        limit,
        offset,
        with: {
          category: true,
          author: { with: { avatar: true } },
          heroImage: true,
          tags: true,
        },
      });

      const totalDocs = total;
      const totalPages = Math.ceil(totalDocs / limit);

      return {
        docs: rows.map(mapPost),
        totalDocs,
        totalPages,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    },
    ["posts-by-author", String(authorId), String(limit), String(page)],
    { revalidate: 300, tags: ["posts"] },
  )();
}

export async function getAuthorBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const row = await db.query.authors.findFirst({
        where: eq(authors.slug, slug),
        with: { avatar: true },
      });
      if (!row) return null;
      return {
        ...row,
        avatar: row.avatar ? { url: row.avatar.url } : null,
      };
    },
    ["author-by-slug", slug],
    { revalidate: 600, tags: ["authors"] },
  )();
}

export const getCategories = unstable_cache(
  async () => {
    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.name)],
    });
    return { docs: rows };
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export const getPageBySlug = unstable_cache(
  async (slug: string) => {
    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);
    return page ?? null;
  },
  ["page-by-slug"],
  { revalidate: 3600, tags: ["pages"] },
);

export const getCategoriesWithCount = unstable_cache(
  async () => {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        postCount: count(posts.id),
      })
      .from(categories)
      .leftJoin(
        posts,
        and(eq(posts.categoryId, categories.id), eq(posts.status, "published")),
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.name));

    return rows;
  },
  ["categories-with-count"],
  { revalidate: 600, tags: ["posts", "categories"] },
);
