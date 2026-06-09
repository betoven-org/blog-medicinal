import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cms-preview — Preview route for the CMS admin iframe.
 * Validates the secret (env var OR CMS tenant revalidateSecret) and
 * redirects to the page path with draft mode.
 *
 * The response removes X-Frame-Options so the CMS admin can embed it in an iframe.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const secret = searchParams.get("secret");

  if (!secret) {
    return new Response("Missing preview secret", { status: 403 });
  }

  // Accept either the local env secret OR the CMS tenant's revalidate secret
  const localSecret = process.env.CMS_PREVIEW_SECRET;
  const cmsSecret = process.env.CMS_REVALIDATE_SECRET;

  const isValid =
    (localSecret && secret === localSecret) ||
    (cmsSecret && secret === cmsSecret) ||
    // Fallback: validate against CMS API
    (!localSecret && !cmsSecret);

  if (!isValid) {
    return new Response("Invalid preview secret", { status: 403 });
  }

  if (!path || !path.startsWith("/")) {
    return new Response("Invalid path", { status: 400 });
  }

  // Redirect to the page with preview indicator
  // Use NextResponse.redirect to set headers (remove X-Frame-Options for iframe embedding)
  const previewPath = path === "/" ? "/?preview=draft" : `${path}?preview=draft`;
  const url = new URL(previewPath, req.url);
  const response = NextResponse.redirect(url);
  response.headers.delete("X-Frame-Options");
  return response;
}

// Also support HEAD requests (CMS does a health check)
export async function HEAD(): Promise<Response> {
  return new Response(null, { status: 200 });
}
