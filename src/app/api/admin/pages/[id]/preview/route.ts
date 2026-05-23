import { NextRequest, NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { pages } from "@brasa/core/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return new NextResponse("Nao autorizado", { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId))
    return new NextResponse("ID invalido", { status: 400 });

  const [page] = await db.select().from(pages).where(eq(pages.id, numId)).limit(1);
  if (!page)
    return new NextResponse("Pagina nao encontrada", { status: 404 });

  const useSections = request.nextUrl.searchParams.get("sections") === "draft";

  // If sections mode, redirect to the actual page with a draft preview param
  if (useSections) {
    const sections = (page.draftSections ?? page.sections) as unknown[] | null;
    if (sections && sections.length > 0) {
      // Render a page that shows sections via iframe pointing to the real page
      const slug = page.slug === "home" ? "/" : `/${page.slug}`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview: ${page.title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Roboto', system-ui, sans-serif; color: #1a1a1a; }
    .preview-banner {
      background: #0d61ac;
      color: white;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.05em;
    }
    .section-list { padding: 16px; max-width: 800px; margin: 0 auto; }
    .section-block {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    .section-badge {
      background: #0d61ac;
      color: white;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .section-props {
      padding: 10px 14px;
      font-size: 12px;
      color: #6b7280;
    }
    .prop-row {
      display: flex;
      gap: 8px;
      padding: 3px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .prop-key { font-weight: 600; color: #374151; min-width: 100px; }
    .prop-val { color: #6b7280; word-break: break-all; }
  </style>
</head>
<body>
  <div class="preview-banner">PREVIEW — Rascunho (sections nao publicadas)</div>
  <div class="section-list">
    ${(sections as any[]).map((s: any, i: number) => `
      <div class="section-block">
        <div class="section-header">
          <span class="section-badge">${i + 1}</span>
          ${s.component}
        </div>
        <div class="section-props">
          ${Object.entries(s.props || {}).map(([k, v]) => `
            <div class="prop-row">
              <span class="prop-key">${k}</span>
              <span class="prop-val">${typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("")}
  </div>
</body>
</html>`;

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Frame-Options": "SAMEORIGIN",
        },
      });
    }
  }

  // Fallback: content-based preview
  const draft = page.draft as Record<string, unknown> | null;
  const title = (draft?.title as string) ?? page.title ?? "";
  const content = (draft?.content as string) ?? page.content ?? "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Roboto', system-ui, sans-serif; color: #1a1a1a; line-height: 1.7; }
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 24px; }
    .header-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; gap: 12px; }
    .logo { height: 28px; }
    .content { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
    .content h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 16px; color: #111; }
    .content h2 { font-size: 1.25rem; font-weight: 600; margin: 24px 0 12px; color: #222; }
    .content h3 { font-size: 1.1rem; font-weight: 600; margin: 20px 0 8px; color: #333; }
    .content p { margin-bottom: 12px; color: #444; }
    .content ul, .content ol { margin: 0 0 12px 24px; color: #444; }
    .content a { color: #0d61ac; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <img src="/logo.svg" alt="Logo" class="logo" />
    </div>
  </header>
  <main class="content">${content}</main>
  <footer class="footer">
    <p>Medicinal na Web - Preview do rascunho</p>
  </footer>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
