import { getPayloadClient } from "@/payload-utils";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const payload = await getPayloadClient();

  const [posts, settings] = await Promise.all([
    payload.find({
      collection: "posts",
      where: { status: { equals: "published" } },
      limit: 50,
      depth: 1,
      sort: "-publishedAt",
    }),
    payload.findGlobal({ slug: "site-settings" as any, depth: 0 }),
  ]);

  const siteName = (settings as any).siteName || "Medicinal na Web";
  const siteDescription =
    (settings as any).siteDescription ||
    "Portal de saude, suplementos naturais, fitoterapia e bem-estar.";

  const items = posts.docs
    .map((post) => {
      const category =
        typeof post.category === "object" && post.category !== null
          ? (post.category as { name?: string }).name
          : null;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date(post.createdAt).toUTCString();

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <pubDate>${pubDate}</pubDate>${category ? `\n      <category><![CDATA[${category}]]></category>` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
