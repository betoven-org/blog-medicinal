import type { MetadataRoute } from "next";
import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function generateSitemaps() {
  // Simple approach: 1 sitemap for posts, 1 for categories/authors, 1 for products
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  // ── Sitemap 0: Static pages + Blog posts ──────────────────────────────
  if (id === 0) {
    const result = await cms.posts.list({ limit: 5000 });

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.3 },
      ...result.docs.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  // ── Sitemap 1: Blog categories + product categories ─────────────────
  if (id === 1) {
    const [categoriesResult, productCategoriesResult] = await Promise.all([
      cms.categories.list(),
      cms.productCategories.list(),
    ]);

    return [
      { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      ...categoriesResult.docs.map((cat) => ({
        url: `${baseUrl}/categorias/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...productCategoriesResult.docs.map((cat) => ({
        url: `${baseUrl}/produtos/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  }

  // ── Sitemap 2: Products ─────────────────────────────────────────────
  if (id === 2) {
    const result = await cms.products.list({ limit: 5000 });

    return result.docs.map((product) => ({
      url: `${baseUrl}/${product.slug}/p`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  return [];
}
