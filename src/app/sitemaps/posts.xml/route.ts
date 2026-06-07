import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function GET() {
  const result = await cms.posts.list({ limit: 5000 });

  const urls = result.docs.map((post) =>
    `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
