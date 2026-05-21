import { db } from "@/db";
import { posts, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const rows = await db
    .select({
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(50);

  const items = rows
    .map((row) => {
      const pubDate = row.publishedAt
        ? new Date(row.publishedAt).toUTCString()
        : new Date(row.createdAt).toUTCString();

      return `    <item>
      <title>${escapeXml(row.title)}</title>
      <link>${baseUrl}/posts/${row.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${row.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(row.excerpt || "")}</description>${row.categoryName ? `\n      <category>${escapeXml(row.categoryName)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Medicinal na Web</title>
    <link>${baseUrl}</link>
    <description>Portal de saude, suplementos naturais, fitoterapia e bem-estar.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
