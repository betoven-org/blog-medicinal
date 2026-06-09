import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCK_BOTS = /semrush|ahref|mj12bot|dotbot|petalbot|bytespider|gptbot|ccbot|claudebot|anthropic|dataprovider|barkrowler|seekport|zoominfobot|censys|netcraft|masscan|nmap|zgrab|httpx|nuclei|nikto|sqlmap|dirbuster|gobuster|wpscan|acunetix|nessus|openvas/i;

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
    res.headers.set("Content-Security-Policy", "frame-ancestors *; frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|xml|woff|woff2|ttf|eot)).*)",
  ],
};
