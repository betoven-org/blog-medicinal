import { auth } from "@/auth";
import { db } from "@/db";
import { posts, tags } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const body = await req.json();
    const { ids, action } = body as {
      ids: number[];
      action: "delete" | "publish" | "unpublish";
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs obrigatorios" }, { status: 400 });
    }

    if (!["delete", "publish", "unpublish"].includes(action)) {
      return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === "delete") {
      await db.delete(tags).where(inArray(tags.postId, ids));
      await db.delete(posts).where(inArray(posts.id, ids));
    } else if (action === "publish") {
      await db
        .update(posts)
        .set({ status: "published", publishedAt: now, updatedAt: now })
        .where(inArray(posts.id, ids));
    } else if (action === "unpublish") {
      await db
        .update(posts)
        .set({ status: "draft", updatedAt: now })
        .where(inArray(posts.id, ids));
    }

    revalidateTag("posts");

    return NextResponse.json({ success: true, affected: ids.length });
  } catch (error) {
    console.error("[POST /api/admin/posts/bulk]", error);
    return NextResponse.json(
      { error: "Erro na operacao em massa" },
      { status: 500 }
    );
  }
}
