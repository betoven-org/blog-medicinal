import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
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
    return NextResponse.next();
  }

  // Admin nao autenticado — redirecionar para login
  if (isAdminRoute && !isAuthenticated) {
    return Response.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  // Login autenticado — redirecionar para admin
  if (isLoginPage && isAuthenticated) {
    return Response.redirect(new URL("/admin", req.nextUrl.origin));
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
          return Response.redirect(
            new URL("/admin/pagamento-pendente", req.nextUrl.origin),
          );
        }
      }
    } catch {
      // Falha na verificacao — permitir acesso (fail open)
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
