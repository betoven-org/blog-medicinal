import type { MetadataRoute } from "next";
import { getPayloadClient } from "@/payload-utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const posts = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit: 1000,
    depth: 0,
  });

  const categories = await payload.find({
    collection: "categories",
    limit: 100,
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...posts.docs.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.docs.map((cat) => ({
      url: `${baseUrl}/categorias/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
