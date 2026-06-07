import { NextResponse } from "next/server";
import { cms } from "@/lib/cms";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api`;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const settings = await cms.settings.get();

  // The SDK returns a structured settings object; robotsTxt is not directly in it.
  // Use the default and append sitemap.
  let content = DEFAULT_ROBOTS;

  // Adiciona Sitemap se nao estiver presente
  if (!content.toLowerCase().includes("sitemap:")) {
    content += `\n\nSitemap: ${baseUrl}/sitemap.xml`;
  }

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
