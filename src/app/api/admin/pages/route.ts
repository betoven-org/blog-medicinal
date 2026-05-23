import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const docs = await db.select().from(pages).orderBy(asc(pages.title));

    return NextResponse.json({ docs });
  } catch (error) {
    console.error("Pages list error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar paginas" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, slug } = body as { title?: string; slug?: string };

    if (!title || !slug) {
      return NextResponse.json({ error: "Titulo e slug sao obrigatorios" }, { status: 400 });
    }

    const normalized = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    const now = new Date().toISOString();
    const [created] = await db.insert(pages).values({
      title,
      slug: normalized,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
      return NextResponse.json({ error: "Ja existe uma pagina com esse slug" }, { status: 409 });
    }
    console.error("Page create error:", error);
    return NextResponse.json({ error: "Erro ao criar pagina" }, { status: 500 });
  }
}
