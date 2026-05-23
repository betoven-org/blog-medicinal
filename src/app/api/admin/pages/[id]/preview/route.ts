import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
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
