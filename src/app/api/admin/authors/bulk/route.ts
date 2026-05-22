import { auth } from "@/auth";
import { db } from "@/db";
import { authors, posts } from "@/db/schema";
import { inArray, eq, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const body = await req.json();
    const { ids, action } = body as { ids: number[]; action: "delete" };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs obrigatorios" }, { status: 400 });
    }

    if (action !== "delete") {
      return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
    }

    for (const id of ids) {
      const [postCount] = await db
        .select({ total: count() })
        .from(posts)
        .where(eq(posts.authorId, id));

      if (postCount.total > 0) {
        return NextResponse.json(
          { error: `Autor ID ${id} possui ${postCount.total} post(s) vinculados` },
          { status: 409 }
        );
      }
    }

    await db.delete(authors).where(inArray(authors.id, ids));

    revalidateTag("authors");

    return NextResponse.json({ success: true, affected: ids.length });
  } catch (error) {
    console.error("[POST /api/admin/authors/bulk]", error);
    return NextResponse.json(
      { error: "Erro na operacao em massa" },
      { status: 500 }
    );
  }
}
