const cmsUrl = (process.env.CMS_URL || "https://cms.brasa.tech").replace(/\/$/, "");
const apiKey = process.env.CMS_API_KEY || "";

export async function fetchSitemapXml(type: string): Promise<Response> {
  const res = await fetch(`${cmsUrl}/api/v1/sitemap?type=${type}`, {
    headers: { "x-api-key": apiKey },
    next: { revalidate: 60, tags: ["sitemap"] },
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("xml")) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`,
      { headers: { "Content-Type": "application/xml" } },
    );
  }

  const xml = await res.text();
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
