import { NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { pages } from "@brasa/core/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId))
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });

  const [page] = await db.select().from(pages).where(eq(pages.id, numId)).limit(1);
  if (!page)
    return NextResponse.json({ error: "Pagina nao encontrada" }, { status: 404 });

  if (!page.draft)
    return NextResponse.json({ error: "Nenhum rascunho para publicar" }, { status: 400 });

  const draft = page.draft as Record<string, unknown>;

  await db.update(pages).set({
    title: (draft.title as string) ?? page.title,
    metaTitle: (draft.metaTitle as string) ?? page.metaTitle,
    metaDescription: (draft.metaDescription as string) ?? page.metaDescription,
    ogTitle: (draft.ogTitle as string) ?? page.ogTitle,
    ogDescription: (draft.ogDescription as string) ?? page.ogDescription,
    ogImageUrl: (draft.ogImageUrl as string) ?? page.ogImageUrl,
    content: (draft.content as string) ?? page.content,
    draft: null,
    updatedAt: new Date().toISOString(),
  }).where(eq(pages.id, numId));

  const [updated] = await db.select().from(pages).where(eq(pages.id, numId)).limit(1);
  return NextResponse.json(updated);
}
