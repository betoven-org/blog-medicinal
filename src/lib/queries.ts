import { getPayloadClient } from "@/payload-utils";

export async function getSiteSettings() {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings" as any, depth: 1 });
}

export async function getFeaturedPost() {
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
}

export async function getLatestPosts(limit = 9, page = 1) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    page,
    depth: 2,
    sort: "-publishedAt",
  });
}

export async function getRecentPosts(limit = 5) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    depth: 1,
    sort: "-createdAt",
  });
}

export async function getPostBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}

export async function getPostsByCategory(categorySlug: string, limit = 12) {
  const payload = await getPayloadClient();
  const category = await payload.find({
    collection: "categories",
    where: { slug: { equals: categorySlug } },
    limit: 1,
  });
  if (!category.docs[0]) return { docs: [], category: null };

  const posts = await payload.find({
    collection: "posts",
    where: {
      status: { equals: "published" },
      category: { equals: category.docs[0].id },
    },
    limit,
    depth: 2,
    sort: "-publishedAt",
  });
  return { docs: posts.docs, category: category.docs[0] };
}

export async function getPostsByCategorySlug(categorySlug: string, limit = 6) {
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
}

export async function getCategories() {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "categories",
    limit: 50,
    sort: "name",
  });
}
