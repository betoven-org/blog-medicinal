import type { MetadataRoute } from "next";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [settings] = await db
    .select({
      robotsIndex: siteSettings.robotsIndex,
      robotsFollow: siteSettings.robotsFollow,
      robotsDisallow: siteSettings.robotsDisallow,
    })
    .from(siteSettings)
    .limit(1);

  const disallowPaths = (settings?.robotsDisallow || "/admin,/api")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const canIndex = settings?.robotsIndex ?? true;

  return {
    rules: [
      {
        userAgent: "*",
        allow: canIndex ? "/" : undefined,
        disallow: canIndex ? disallowPaths : ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
