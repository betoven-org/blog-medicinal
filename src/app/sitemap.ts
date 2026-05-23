import type { MetadataRoute } from "next";
import { db } from "@brasa/core/db";
import { posts, categories, authors, products, productCategories } from "@brasa/core/schema";
import { and, eq, count } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const PER_SITEMAP = 5000;

// Sitemap index: Next.js calls generateSitemaps() to get the list,
// then calls sitemap({ id }) for each one.
// IDs: 0 = static + blog posts, 1 = blog categories + authors, 2+ = products (paginated)

export async function generateSitemaps() {
  const tenantId = await getTenantId();
  const [productCount] = await db.select({ total: count() }).from(products).where(and(eq(products.status, "published"), eq(products.tenantId, tenantId)));
  const totalProducts = productCount?.total ?? 0;
  const productPages = Math.ceil(totalProducts / PER_SITEMAP);

  // 0 = static + posts, 1 = blog categories + authors, 2 = product categories, 3..N = products
  const ids = [
    { id: 0 }, // static + posts
    { id: 1 }, // blog categories + authors
    { id: 2 }, // product categories
  ];

  for (let i = 0; i < productPages; i++) {
    ids.push({ id: 3 + i }); // products paginated
  }

  return ids;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const tenantId = await getTenantId();
  // ── Sitemap 0: Static pages + Blog posts ──────────────────────────────
  if (id === 0) {
    const allPosts = await db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(and(eq(posts.status, "published"), eq(posts.tenantId, tenantId)));

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.3 },
      ...allPosts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  // ── Sitemap 1: Blog categories + Authors ──────────────────────────────
  if (id === 1) {
    const [allCategories, allAuthors] = await Promise.all([
      db.select({ slug: categories.slug, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.tenantId, tenantId)),
      db.select({ slug: authors.slug, updatedAt: authors.updatedAt }).from(authors).where(eq(authors.tenantId, tenantId)),
    ]);

    return [
      { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      ...allCategories.map((cat) => ({
        url: `${baseUrl}/categorias/${cat.slug}`,
        lastModified: new Date(cat.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...allAuthors.filter((a) => a.slug).map((author) => ({
        url: `${baseUrl}/autores/${author.slug}`,
        lastModified: new Date(author.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  }

  // ── Sitemap 2: Product categories ─────────────────────────────────────
  if (id === 2) {
    const allProductCats = await db
      .select({ slug: productCategories.slug, updatedAt: productCategories.updatedAt })
      .from(productCategories)
      .where(eq(productCategories.tenantId, tenantId));

    return allProductCats.map((cat) => ({
      url: `${baseUrl}/produtos/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  // ── Sitemap 3+: Products (paginated) ──────────────────────────────────
  const productPage = id - 3;
  if (productPage < 0) return [];
  const offset = productPage * PER_SITEMAP;

  const allProducts = await db
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(and(eq(products.status, "published"), eq(products.tenantId, tenantId)))
    .limit(PER_SITEMAP)
    .offset(offset);

  return allProducts.map((product) => ({
    url: `${baseUrl}/${product.slug}/p`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
