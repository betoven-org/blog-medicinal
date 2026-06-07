import { cms } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const revalidate = 3600;

export async function GET() {
  const result = await cms.categories.list();

  const urls = [
    `  <url>\n    <loc>${baseUrl}/categorias</loc>\n  </url>`,
    ...result.docs.map((cat) =>
      `  <url>\n    <loc>${baseUrl}/categorias/${cat.slug}</loc>\n  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
