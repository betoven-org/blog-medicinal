import Script from "next/script";
import { db } from "@brasa/core/db";
import { siteSettings } from "@brasa/core/schema";

export async function UmamiScript() {
  const settings = await db.select({
    umamiWebsiteId: siteSettings.umamiWebsiteId,
    umamiUrl: siteSettings.umamiUrl,
  }).from(siteSettings).limit(1);

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
