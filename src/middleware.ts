import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TENANT_HEADER = "x-tenant-id";

const BLOCK_BOTS = /semrush|ahref|mj12bot|dotbot|petalbot|bytespider|gptbot|ccbot|claudebot|anthropic|dataprovider|barkrowler|seekport|zoominfobot|censys|netcraft|masscan|nmap|zgrab|httpx|nuclei|nikto|sqlmap|dirbuster|gobuster|wpscan|acunetix|nessus|openvas/i;

// In-memory tenant cache (hostname -> tenantId, TTL 5min)
const tenantCache = new Map<string, { id: number; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function resolveTenantId(host: string, origin: string): Promise<number> {
  const hostname = host.split(":")[0];

  const cached = tenantCache.get(hostname);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.id;
  }

  try {
    const res = await fetch(`${origin}/api/tenant?host=${encodeURIComponent(hostname)}`);
    if (res.ok) {
      const data = await res.json();
      const id = data.id || 1;
      tenantCache.set(hostname, { id, ts: Date.now() });
      return id;
    }
  } catch {
    // Fallback on error
  }

  return 1;
}

export default async function middleware(req: NextRequest) {
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

  // Skip tenant resolution for tenant API itself
  if (pathname === "/api/tenant") {
    return NextResponse.next();
  }

  // Resolve tenant and inject header
  const host = req.headers.get("host") || "localhost";
  const tenantId = await resolveTenantId(host, req.nextUrl.origin);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(TENANT_HEADER, String(tenantId));

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set(TENANT_HEADER, String(tenantId));
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
