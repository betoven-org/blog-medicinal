import { cms, type PostListItem } from "@/lib/cms";

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function toPostCard(post: PostListItem): PostCard {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverUrl: post.coverUrl,
    heroImageUrl: post.heroImage?.url ?? null,
    categoryName: post.category?.name ?? null,
    categorySlug: post.category?.slug ?? null,
    authorName: post.author?.name ?? null,
    publishedAt: post.publishedAt,
    readingTimeMinutes: post.readingTimeMinutes,
  };
}

// ── Loader ───────────────────────────────────────────────────────────────────

/**
 * Busca posts por modo. Usado pelas sections HeroPost, PostGrid, PostCarousel.
 */
export async function getPostsByMode(
  mode: PostMode,
  limit: number = 6,
  manualSlugs?: string[],
): Promise<PostCard[]> {
  switch (mode) {
    case "recent": {
      const result = await cms.posts.list({ limit });
      return result.docs.map(toPostCard);
    }

    case "editor-picks": {
      const result = await cms.posts.list({ limit, featured: true });
      return result.docs.map(toPostCard);
    }

    case "trending":
    case "popular": {
      // SDK does not support trending/popular by metrics.
      // Fallback to recent posts as the API handles ordering server-side.
      const result = await cms.posts.list({ limit });
      return result.docs.map(toPostCard);
    }

    case "manual": {
      if (!manualSlugs || manualSlugs.length === 0) return [];

      // Fetch enough posts and filter by slugs
      const result = await cms.posts.list({ limit: 50 });
      const slugSet = new Set(manualSlugs);
      const filtered = result.docs.filter((p) => slugSet.has(p.slug));

      // Preserve manual slug order
      return manualSlugs
        .map((slug) => filtered.find((p) => p.slug === slug))
        .filter(Boolean)
        .slice(0, limit)
        .map((p) => toPostCard(p!));
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
  if (mode === "manual" && manualSlug) {
    const post = await cms.posts.getBySlug(manualSlug);
    if (!post) return null;
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverUrl: post.coverUrl,
      heroImageUrl: post.heroImage?.url ?? null,
      categoryName: post.category?.name ?? null,
      categorySlug: post.category?.slug ?? null,
      authorName: post.author?.name ?? null,
      publishedAt: post.publishedAt,
      readingTimeMinutes: post.readingTimeMinutes,
    };
  }

  // Featured: get the featured post from the API
  const featured = await cms.posts.featured();
  if (featured) return toPostCard(featured);

  // Fallback: most recent post
  const result = await cms.posts.list({ limit: 1 });
  if (result.docs.length === 0) return null;
  return toPostCard(result.docs[0]);
}
