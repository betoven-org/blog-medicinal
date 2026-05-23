import { NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { pages } from "@brasa/core/schema";
import { and, eq } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  const tenantId = await getTenantId();
  if (isNaN(numId))
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });

  const [page] = await db.select().from(pages).where(and(eq(pages.id, numId), eq(pages.tenantId, tenantId))).limit(1);
  if (!page)
    return NextResponse.json({ error: "Pagina nao encontrada" }, { status: 404 });

  if (!page.draft && !page.draftSections)
    return NextResponse.json({ error: "Nenhum rascunho para publicar" }, { status: 400 });

  const draft = (page.draft as Record<string, unknown>) || {};

  const updateData: Record<string, unknown> = {
    draft: null,
    draftSections: null,
    updatedAt: new Date().toISOString(),
  };

  // Publish content draft
  if (page.draft) {
    updateData.title = (draft.title as string) ?? page.title;
    updateData.metaTitle = (draft.metaTitle as string) ?? page.metaTitle;
    updateData.metaDescription = (draft.metaDescription as string) ?? page.metaDescription;
    updateData.ogTitle = (draft.ogTitle as string) ?? page.ogTitle;
    updateData.ogDescription = (draft.ogDescription as string) ?? page.ogDescription;
    updateData.ogImageUrl = (draft.ogImageUrl as string) ?? page.ogImageUrl;
    updateData.content = (draft.content as string) ?? page.content;
  }

  // Publish sections draft
  if (page.draftSections) {
    updateData.sections = page.draftSections;
  }

  await db.update(pages).set(updateData).where(and(eq(pages.id, numId), eq(pages.tenantId, tenantId)));

  const [updated] = await db.select().from(pages).where(and(eq(pages.id, numId), eq(pages.tenantId, tenantId))).limit(1);
  return NextResponse.json(updated);
}
