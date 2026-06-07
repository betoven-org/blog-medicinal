import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function GET() {
  const result = await cms.categories.list();

  const urls = result.docs.map((cat) =>
    `  <url>
    <loc>${baseUrl}/categorias/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/categorias</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
