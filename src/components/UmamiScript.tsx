import Script from "next/script";
import { cms } from "@/lib/cms";

export async function UmamiScript() {
  const settings = await cms.settings.get();

  const websiteId = settings.analytics?.umamiWebsiteId;
  const umamiUrl = settings.analytics?.umamiUrl;

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
