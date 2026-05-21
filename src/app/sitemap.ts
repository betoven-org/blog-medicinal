import type { MetadataRoute } from "next";
import { db } from "@/db";
import { posts, categories, authors } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [allPosts, allCategories, allAuthors] = await Promise.all([
    db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, "published")),
    db.select({ slug: categories.slug, updatedAt: categories.updatedAt }).from(categories),
    db.select({ slug: authors.slug, updatedAt: authors.updatedAt }).from(authors),
  ]);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...allPosts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...allCategories.map((cat) => ({
      url: `${baseUrl}/categorias/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...allAuthors
      .filter((a) => a.slug)
      .map((author) => ({
        url: `${baseUrl}/autores/${author.slug}`,
        lastModified: new Date(author.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];
}
