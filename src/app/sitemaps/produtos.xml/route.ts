import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function GET() {
  const [productsResult, categoriesResult] = await Promise.all([
    cms.products.list({ limit: 5000 }),
    cms.productCategories.list(),
  ]);

  const categoryUrls = categoriesResult.docs.map((cat) =>
    `  <url>
    <loc>${baseUrl}/produtos/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  ).join("\n");

  const productUrls = productsResult.docs.map((product) =>
    `  <url>
    <loc>${baseUrl}/${product.slug}/p</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/produtos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
${categoryUrls}
${productUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
