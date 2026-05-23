import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseBody, updatePageSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const pageId = Number(id);

    if (isNaN(pageId))
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });

    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!page)
      return NextResponse.json({ error: "Pagina nao encontrada" }, { status: 404 });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Pages get error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pagina" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const pageId = Number(id);

    if (isNaN(pageId))
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });

    const body = await request.json();
    const parsed = parseBody(updatePageSchema, body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const [existing] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!existing)
      return NextResponse.json({ error: "Pagina nao encontrada" }, { status: 404 });

    const draftData = {
      title: parsed.data.title,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      ogTitle: parsed.data.ogTitle,
      ogDescription: parsed.data.ogDescription,
      ogImageUrl: parsed.data.ogImageUrl,
      content: parsed.data.content,
    };

    const [updated] = await db
      .update(pages)
      .set({ draft: draftData, updatedAt: new Date().toISOString() })
      .where(eq(pages.id, pageId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Pages update error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pagina" },
      { status: 500 },
    );
  }
}
