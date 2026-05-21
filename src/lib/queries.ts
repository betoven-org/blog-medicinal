import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/payload-utils";

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    return payload.findGlobal({ slug: "site-settings" as any, depth: 1 });
  },
  ["site-settings"],
  { revalidate: 3600, tags: ["settings"] }
);

export const getFeaturedPost = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "posts",
      where: {
        status: { equals: "published" },
        featured: { equals: true },
      },
      limit: 1,
      depth: 2,
      sort: "-publishedAt",
    });
    return result.docs[0] ?? null;
  },
  ["featured-post"],
  { revalidate: 300, tags: ["posts"] }
);

export async function getLatestPosts(limit = 9, page = 1) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient();
      return payload.find({
        collection: "posts",
        where: { status: { equals: "published" } },
        limit,
        page,
        depth: 2,
        sort: "-publishedAt",
      });
    },
    ["latest-posts", String(limit), String(page)],
    { revalidate: 300, tags: ["posts"] }
  )();
}

export const getRecentPosts = unstable_cache(
  async (limit = 5) => {
    const payload = await getPayloadClient();
    return payload.find({
      collection: "posts",
      where: { status: { equals: "published" } },
      limit,
      depth: 1,
      sort: "-createdAt",
    });
  },
  ["recent-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "posts",
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });
      return result.docs[0] ?? null;
    },
    ["post-by-slug", slug],
    { revalidate: 600, tags: ["posts"] }
  )();
}

export async function getPostsByCategory(categorySlug: string, limit = 12, page = 1) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient();
      const category = await payload.find({
        collection: "categories",
        where: { slug: { equals: categorySlug } },
        limit: 1,
      });
      if (!category.docs[0]) return { docs: [], category: null, totalPages: 0, totalDocs: 0 };

      const posts = await payload.find({
        collection: "posts",
        where: {
          status: { equals: "published" },
          category: { equals: category.docs[0].id },
        },
        limit,
        page,
        depth: 2,
        sort: "-publishedAt",
      });
      return {
        docs: posts.docs,
        category: category.docs[0],
        totalPages: posts.totalPages,
        totalDocs: posts.totalDocs,
      };
    },
    ["posts-by-category", categorySlug, String(limit), String(page)],
    { revalidate: 300, tags: ["posts", "categories"] }
  )();
}

export async function getPostsByCategorySlug(categorySlug: string, limit = 6) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient();
      const categoryResult = await payload.find({
        collection: "categories",
        where: { slug: { equals: categorySlug } },
        limit: 1,
      });
      if (!categoryResult.docs[0]) return { docs: [] };

      const posts = await payload.find({
        collection: "posts",
        where: {
          status: { equals: "published" },
          category: { equals: categoryResult.docs[0].id },
        },
        limit,
        depth: 2,
        sort: "-publishedAt",
      });
      return { docs: posts.docs };
    },
    ["posts-by-cat-slug", categorySlug, String(limit)],
    { revalidate: 300, tags: ["posts"] }
  )();
}

export async function getRelatedPosts(
  categoryId: string | number,
  excludePostId: string | number,
  limit = 3,
) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient();
      return payload.find({
        collection: "posts",
        where: {
          and: [
            { status: { equals: "published" } },
            { category: { equals: categoryId } },
            { id: { not_equals: excludePostId } },
          ],
        },
        limit,
        depth: 2,
        sort: "-publishedAt",
      });
    },
    ["related-posts", String(categoryId), String(excludePostId)],
    { revalidate: 300, tags: ["posts"] }
  )();
}

export const getCategories = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    return payload.find({
      collection: "categories",
      limit: 50,
      sort: "name",
    });
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCategoriesWithCount = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const categories = await payload.find({
      collection: "categories",
      limit: 50,
      sort: "name",
    });

    const counts = await Promise.all(
      categories.docs.map(async (cat) => {
        const posts = await payload.count({
          collection: "posts",
          where: {
            status: { equals: "published" },
            category: { equals: cat.id },
          },
        });
        return { ...cat, postCount: posts.totalDocs };
      }),
    );

    return counts;
  },
  ["categories-with-count"],
  { revalidate: 600, tags: ["posts", "categories"] }
);
