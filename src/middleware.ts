import { auth } from "@brasa/core/auth";
import { NextResponse } from "next/server";

const INGEST_SECRET = process.env.METRICS_INGEST_SECRET || "metrics-internal-key";

// Paths to skip metrics collection (static assets, internal APIs)
const SKIP_METRICS = /^\/((_next|favicon|logo|apple-touch|manifest|robots|sitemap|feed|api\/metrics))/;

export default auth(async (req) => {
  const start = Date.now();
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isPaymentPage = pathname === "/admin/pagamento-pendente";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAuthenticated = !!req.auth;

  // Rotas publicas — nunca bloquear
  if (
    isLoginPage ||
    isPaymentPage ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/subscription-status")
  ) {
    return trackAndReturn(NextResponse.next(), req, start);
  }

  // Admin nao autenticado — redirecionar para login
  if (isAdminRoute && !isAuthenticated) {
    return trackAndReturn(
      Response.redirect(new URL("/admin/login", req.nextUrl.origin)),
      req,
      start,
    );
  }

  // Login autenticado — redirecionar para admin
  if (isLoginPage && isAuthenticated) {
    return trackAndReturn(
      Response.redirect(new URL("/admin", req.nextUrl.origin)),
      req,
      start,
    );
  }

  // Rotas admin autenticadas — verificar assinatura
  if ((isAdminRoute || isAdminApi) && isAuthenticated) {
    try {
      const statusRes = await fetch(
        new URL("/api/subscription-status", req.nextUrl.origin),
      );
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (data.status === "suspended") {
          return trackAndReturn(
            Response.redirect(
              new URL("/admin/pagamento-pendente", req.nextUrl.origin),
            ),
            req,
            start,
          );
        }
      }
    } catch {
      // Falha na verificacao — permitir acesso (fail open)
    }
  }

  return trackAndReturn(NextResponse.next(), req, start);
});

function trackAndReturn(response: Response, req: Parameters<Parameters<typeof auth>[0]>[0], start: number) {
  const { pathname } = req.nextUrl;

  // Skip metrics for static assets and internal routes
  if (SKIP_METRICS.test(pathname)) return response;

  // Fire-and-forget metrics collection (non-blocking)
  const latencyMs = Date.now() - start;
  const statusCode = response.status || 200;

  try {
    const origin = req.nextUrl.origin;
    fetch(`${origin}/api/metrics/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-metrics-secret": INGEST_SECRET,
      },
      body: JSON.stringify({
        path: pathname,
        method: req.method,
        statusCode,
        latencyMs,
        country: req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || null,
        city: req.headers.get("x-vercel-ip-city") || null,
        userAgent: req.headers.get("user-agent") || "",
        referer: req.headers.get("referer") || null,
        contentLength: response.headers.get("content-length")
          ? parseInt(response.headers.get("content-length")!, 10)
          : null,
      }),
    }).catch(() => {}); // Silently ignore failures
  } catch {
    // Never block the response
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
