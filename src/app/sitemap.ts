import type { MetadataRoute } from "next";
import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsResult, categoriesResult, productCategoriesResult, productsResult] =
    await Promise.all([
      cms.posts.list({ limit: 5000 }),
      cms.categories.list(),
      cms.productCategories.list(),
      cms.products.list({ limit: 5000 }),
    ]);

  return [
    // Static
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/produtos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },

    // Posts
    ...postsResult.docs.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // Blog categories
    ...categoriesResult.docs.map((cat) => ({
      url: `${baseUrl}/categorias/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),

    // Product categories
    ...productCategoriesResult.docs.map((cat) => ({
      url: `${baseUrl}/produtos/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    // Products
    ...productsResult.docs.map((product) => ({
      url: `${baseUrl}/${product.slug}/p`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
