import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only block actual malicious bots/scanners — allow SEO crawlers (Ahrefs, Semrush, etc.)
const BLOCK_BOTS = /mj12bot|bytespider|censys|netcraft|masscan|nmap|zgrab|httpx|nuclei|nikto|sqlmap|dirbuster|gobuster|wpscan|acunetix|nessus|openvas/i;

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // Block malicious bots
  if (BLOCK_BOTS.test(ua)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Block requests without user-agent (almost always bots)
  if (!ua && !pathname.startsWith("/api/")) {
    return new Response("Forbidden", { status: 403 });
  }

  const res = NextResponse.next();

  // Allow CMS iframe embedding for preview pages
  if (pathname.startsWith("/preview/") || req.nextUrl.searchParams.get("preview") === "draft") {
    res.headers.delete("X-Frame-Options");
    res.headers.delete("Content-Security-Policy");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|xml|woff|woff2|ttf|eot)).*)",
  ],
};
