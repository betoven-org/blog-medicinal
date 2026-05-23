import Script from "next/script";
import { db } from "@brasa/core/db";
import { siteSettings } from "@brasa/core/schema";
import { eq } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

export async function UmamiScript() {
  const tenantId = await getTenantId();
  const settings = await db.select({
    umamiWebsiteId: siteSettings.umamiWebsiteId,
    umamiUrl: siteSettings.umamiUrl,
  }).from(siteSettings).where(eq(siteSettings.tenantId, tenantId)).limit(1);

  const websiteId = settings[0]?.umamiWebsiteId;
  const umamiUrl = settings[0]?.umamiUrl;

  if (!websiteId || !umamiUrl) return null;

  const scriptSrc = umamiUrl.replace(/\/$/, "") + "/script.js";

  return (
    <Script
      src={scriptSrc}
      data-website-id={websiteId}
      strategy="afterInteractive"
      async
    />
  );
}
