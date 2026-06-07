import Script from "next/script";
import { cms } from "@/lib/cms";

export async function AnalyticsScripts() {
  const settings = await cms.settings.get();

  const gtmId = settings.analytics?.gtmId;
  const ga4Id = settings.analytics?.ga4Id;
  const googleAdsId = settings.analytics?.googleAdsId;
  const facebookPixelId = settings.analytics?.facebookPixelId;
  const umamiWebsiteId = settings.analytics?.umamiWebsiteId;
  const umamiUrl = settings.analytics?.umamiUrl;
  const headScripts = settings.scripts?.head;
  const bodyScripts = settings.scripts?.body;

  return (
    <>
      {/* GTM — head script */}
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* GA4 — standalone (skip if GTM already handles it) */}
      {ga4Id && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');${googleAdsId ? `gtag('config','${googleAdsId}');` : ""}`}
          </Script>
        </>
      )}

      {/* Google Ads — standalone (only if no GA4 and no GTM) */}
      {googleAdsId && !ga4Id && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="gads" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAdsId}');`}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {/* Umami */}
      {umamiWebsiteId && umamiUrl && (
        <Script
          src={`${umamiUrl.replace(/\/$/, "")}/script.js`}
          data-website-id={umamiWebsiteId}
          strategy="afterInteractive"
          async
        />
      )}

      {/* Custom head scripts */}
      {headScripts && (
        <div dangerouslySetInnerHTML={{ __html: headScripts }} />
      )}

      {/* GTM noscript fallback */}
      {gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      )}

      {/* Facebook Pixel noscript fallback */}
      {facebookPixelId && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}

      {/* Custom body scripts */}
      {bodyScripts && (
        <div dangerouslySetInnerHTML={{ __html: bodyScripts }} />
      )}
    </>
  );
}
