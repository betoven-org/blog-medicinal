import { cms } from "@/lib/cms";

// ── Queries ─────────────────────────────────────────────────────────────────────

export async function getSiteSettings() {
  const settings = await cms.settings.get();
  if (!settings) {
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
  return settings;
}

export async function getFeaturedPost() {
  return cms.posts.featured();
}

export async function getLatestPosts(limit = 9, page = 1) {
  return cms.posts.list({ limit, page });
}

export async function getRecentPosts(limit = 5) {
  const result = await cms.posts.list({ limit, page: 1 });
  return { docs: result.docs };
}

export async function getPostBySlug(slug: string) {
  return cms.posts.getBySlug(slug);
}

export async function getPostsByCategory(
  categorySlug: string,
  limit = 12,
  page = 1,
) {
  const result = await cms.posts.list({ category: categorySlug, limit, page });
  // The SDK returns paginated results; we also need the category object
  const categoriesResult = await cms.categories.list({ withCount: false });
  const category =
    categoriesResult.docs.find((c: any) => c.slug === categorySlug) ?? null;

  return {
    docs: result.docs,
    category,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  };
}

export async function getPostsByCategorySlug(
  categorySlug: string,
  limit = 6,
) {
  const result = await cms.posts.list({ category: categorySlug, limit });
  return { docs: result.docs };
}

export async function getRelatedPosts(
  categoryId: string | number,
  excludePostId: string | number,
  limit = 3,
) {
  // SDK doesn't support exclude param, so fetch extra and filter client-side
  const result = await cms.posts.list({
    category: String(categoryId),
    limit: limit + 1,
  });

  const filtered = result.docs
    .filter((post: any) => post.id !== Number(excludePostId))
    .slice(0, limit);

  return {
    docs: filtered,
    totalDocs: filtered.length,
    totalPages: 1,
  };
}

export async function searchPosts(
  query: string,
  categorySlug?: string,
  limit = 12,
  page = 1,
) {
  return cms.posts.list({
    search: query,
    category: categorySlug,
    limit,
    page,
  });
}

export async function getPostsByAuthor(
  authorId: string | number,
  limit = 12,
  page = 1,
) {
  return cms.posts.list({ author: String(authorId), limit, page });
}

export async function getAuthorBySlug(slug: string) {
  return cms.authors.getBySlug(slug);
}

export async function getCategories() {
  return cms.categories.list({ withCount: false });
}

export async function getPageBySlug(slug: string) {
  return cms.pages.get(slug, { draft: false });
}

export async function getCategoriesWithCount() {
  const result = await cms.categories.list({ withCount: true });
  return result.docs;
}
