import { db } from "@brasa/core/db";
import { posts, categories, authors, media, requestMetrics } from "@brasa/core/schema";
import { eq, desc, and, sql, inArray, gte } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

// ── Types ────────────────────────────────────────────────────────────────────

export type PostCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  heroImageUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  authorName: string | null;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  views?: number;
};

export type PostMode = "recent" | "trending" | "popular" | "editor-picks" | "manual";

// ── Loader ───────────────────────────────────────────────────────────────────

const baseSelect = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  excerpt: posts.excerpt,
  coverUrl: posts.coverUrl,
  heroImageUrl: media.url,
  categoryName: categories.name,
  categorySlug: categories.slug,
  authorName: authors.name,
  publishedAt: posts.publishedAt,
  readingTimeMinutes: posts.readingTimeMinutes,
};

const baseFrom = (tenantId: number) =>
  db
    .select(baseSelect)
    .from(posts)
    .leftJoin(media, eq(posts.heroImageId, media.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .$dynamic();

const publishedWhere = (tenantId: number) =>
  and(eq(posts.status, "published"), eq(posts.tenantId, tenantId));

/**
 * Busca posts por modo. Usado pelas sections HeroPost, PostGrid, PostCarousel.
 */
export async function getPostsByMode(
  mode: PostMode,
  limit: number = 6,
  manualSlugs?: string[],
): Promise<PostCard[]> {
  const tenantId = await getTenantId();
  const published = publishedWhere(tenantId);

  switch (mode) {
    case "recent":
      return baseFrom(tenantId)
        .where(published)
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

    case "editor-picks":
      return baseFrom(tenantId)
        .where(and(published, eq(posts.featured, true)))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

    case "trending": {
      // Posts mais vistos nos ultimos 7 dias (request_metrics)
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const topPaths = await db
        .select({
          slug: sql<string>`replace(${requestMetrics.path}, '/', '')`,
          views: sql<number>`count(*)::int`,
        })
        .from(requestMetrics)
        .where(
          and(
            eq(requestMetrics.tenantId, tenantId),
            gte(requestMetrics.createdAt, sevenDaysAgo),
            eq(requestMetrics.isBot, false),
            sql`${requestMetrics.path} NOT LIKE '/admin%'`,
            sql`${requestMetrics.path} NOT LIKE '/api%'`,
            sql`${requestMetrics.path} NOT LIKE '%/p'`, // exclude product pages
            sql`${requestMetrics.path} != '/'`,
          ),
        )
        .groupBy(requestMetrics.path)
        .orderBy(sql`count(*) desc`)
        .limit(limit * 2); // fetch extra to account for non-post paths

      if (topPaths.length === 0) {
        // Fallback to recent if no metrics
        return getPostsByMode("recent", limit);
      }

      const slugs = topPaths.map((p) => p.slug);
      const viewsMap = Object.fromEntries(topPaths.map((p) => [p.slug, p.views]));

      const result = await baseFrom(tenantId)
        .where(and(published, inArray(posts.slug, slugs)))
        .limit(limit);

      return result
        .map((p) => ({ ...p, views: viewsMap[p.slug] || 0 }))
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limit);
    }

    case "popular": {
      // Posts mais vistos all-time
      const topPaths = await db
        .select({
          slug: sql<string>`replace(${requestMetrics.path}, '/', '')`,
          views: sql<number>`count(*)::int`,
        })
        .from(requestMetrics)
        .where(
          and(
            eq(requestMetrics.tenantId, tenantId),
            eq(requestMetrics.isBot, false),
            sql`${requestMetrics.path} NOT LIKE '/admin%'`,
            sql`${requestMetrics.path} NOT LIKE '/api%'`,
            sql`${requestMetrics.path} NOT LIKE '%/p'`,
            sql`${requestMetrics.path} != '/'`,
          ),
        )
        .groupBy(requestMetrics.path)
        .orderBy(sql`count(*) desc`)
        .limit(limit * 2);

      if (topPaths.length === 0) {
        return getPostsByMode("recent", limit);
      }

      const slugs = topPaths.map((p) => p.slug);
      const viewsMap = Object.fromEntries(topPaths.map((p) => [p.slug, p.views]));

      const result = await baseFrom(tenantId)
        .where(and(published, inArray(posts.slug, slugs)))
        .limit(limit);

      return result
        .map((p) => ({ ...p, views: viewsMap[p.slug] || 0 }))
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limit);
    }

    case "manual": {
      if (!manualSlugs || manualSlugs.length === 0) return [];

      const result = await baseFrom(tenantId)
        .where(and(published, inArray(posts.slug, manualSlugs)))
        .limit(limit);

      // Preservar a ordem dos slugs manuais
      return manualSlugs
        .map((slug) => result.find((p) => p.slug === slug))
        .filter(Boolean) as PostCard[];
    }

    default:
      return getPostsByMode("recent", limit);
  }
}

/**
 * Busca um unico post destaque para o HeroPost.
 */
export async function getFeaturedPost(
  mode: "featured" | "manual" = "featured",
  manualSlug?: string,
): Promise<PostCard | null> {
  const tenantId = await getTenantId();
  const published = publishedWhere(tenantId);

  if (mode === "manual" && manualSlug) {
    const result = await baseFrom(tenantId)
      .where(and(published, eq(posts.slug, manualSlug)))
      .limit(1);
    return result[0] || null;
  }

  // Featured: pega o post mais recente com featured=true
  const result = await baseFrom(tenantId)
    .where(and(published, eq(posts.featured, true)))
    .orderBy(desc(posts.publishedAt))
    .limit(1);

  // Fallback: post mais recente
  if (result.length === 0) {
    const fallback = await baseFrom(tenantId)
      .where(published)
      .orderBy(desc(posts.publishedAt))
      .limit(1);
    return fallback[0] || null;
  }

  return result[0] || null;
}
