import { NextResponse } from "next/server";
import { db } from "@brasa/core/db";
import { siteSettings } from "@brasa/core/schema";
import { eq } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api`;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const tenantId = await getTenantId();

  const [settings] = await db
    .select({ robotsTxt: siteSettings.robotsTxt })
    .from(siteSettings)
    .where(eq(siteSettings.tenantId, tenantId))
    .limit(1);

  let content = settings?.robotsTxt || DEFAULT_ROBOTS;

  // Adiciona Sitemap se nao estiver presente
  if (!content.toLowerCase().includes("sitemap:")) {
    content += `\n\nSitemap: ${baseUrl}/sitemap.xml`;
  }

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
