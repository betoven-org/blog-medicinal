import { auth } from "@/auth";
import { db } from "@/db";
import { productCategories, products } from "@/db/schema";
import { inArray, eq, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { ids, action } = (await req.json()) as { ids: number[]; action: "delete" };

    if (!ids?.length)
      return NextResponse.json({ error: "IDs obrigatorios" }, { status: 400 });
    if (action !== "delete")
      return NextResponse.json({ error: "Acao invalida" }, { status: 400 });

    for (const id of ids) {
      const [pc] = await db.select({ total: count() }).from(products).where(eq(products.productCategoryId, id));
      if (pc.total > 0) {
        return NextResponse.json(
          { error: `Categoria ID ${id} possui ${pc.total} produto(s) vinculados` },
          { status: 409 }
        );
      }
    }

    await db.delete(productCategories).where(inArray(productCategories.id, ids));

    revalidateTag("product-categories");

    return NextResponse.json({ success: true, affected: ids.length });
  } catch (error) {
    console.error("[POST /api/admin/product-categories/bulk]", error);
    return NextResponse.json({ error: "Erro na operacao em massa" }, { status: 500 });
  }
}
