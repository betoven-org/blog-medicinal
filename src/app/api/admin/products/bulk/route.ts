import { auth } from "@/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { ids, action } = (await req.json()) as {
      ids: number[];
      action: "delete" | "publish" | "unpublish";
    };

    if (!ids?.length)
      return NextResponse.json({ error: "IDs obrigatorios" }, { status: 400 });

    if (!["delete", "publish", "unpublish"].includes(action))
      return NextResponse.json({ error: "Acao invalida" }, { status: 400 });

    const now = new Date().toISOString();

    if (action === "delete") {
      await db.delete(products).where(inArray(products.id, ids));
    } else if (action === "publish") {
      await db
        .update(products)
        .set({ status: "published", publishedAt: now, updatedAt: now })
        .where(inArray(products.id, ids));
    } else if (action === "unpublish") {
      await db
        .update(products)
        .set({ status: "draft", updatedAt: now })
        .where(inArray(products.id, ids));
    }

    revalidateTag("products");

    return NextResponse.json({ success: true, affected: ids.length });
  } catch (error) {
    console.error("[POST /api/admin/products/bulk]", error);
    return NextResponse.json({ error: "Erro na operacao em massa" }, { status: 500 });
  }
}
