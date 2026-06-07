const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function GET() {
  const sitemaps = [
    `${baseUrl}/sitemaps/paginas.xml`,
    `${baseUrl}/sitemaps/posts.xml`,
    `${baseUrl}/sitemaps/produtos.xml`,
    `${baseUrl}/sitemaps/categorias.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((url) => `  <sitemap>\n    <loc>${url}</loc>\n  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
