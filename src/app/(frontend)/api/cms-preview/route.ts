import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

/**
 * GET /api/cms-preview — Preview route for the CMS admin iframe.
 * Validates the secret and redirects to the page path.
 * The page will detect draft mode via the ?preview=draft query param.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.CMS_PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 403 });
  }

  if (!path || !path.startsWith("/")) {
    return new Response("Invalid path", { status: 400 });
  }

  // Redirect to the page with a preview indicator
  const previewPath = path === "/" ? "/?preview=draft" : `${path}?preview=draft`;
  redirect(previewPath);
}
