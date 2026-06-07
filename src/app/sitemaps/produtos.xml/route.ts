import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const revalidate = 3600;

export async function GET() {
  const [productsResult, categoriesResult] = await Promise.all([
    cms.products.list({ limit: 5000 }),
    cms.productCategories.list(),
  ]);

  const urls = [
    `  <url>\n    <loc>${baseUrl}/produtos</loc>\n  </url>`,
    ...categoriesResult.docs.map((cat) =>
      `  <url>\n    <loc>${baseUrl}/produtos/${cat.slug}</loc>\n  </url>`
    ),
    ...productsResult.docs.map((product) => {
      const p = product as any;
      const lastmod = p.updatedAt;
      return `  <url>\n    <loc>${baseUrl}/${product.slug}/p</loc>${
        lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""
      }\n  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
