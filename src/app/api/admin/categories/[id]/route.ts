import { auth } from "@/auth";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { generateSlug } from "@/lib/slug";
import { parseBody, updateCategorySchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[GET /api/admin/categories/:id]", error);
    return NextResponse.json(
      { error: "Erro ao buscar categoria" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = parseBody(updateCategorySchema, body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const updateData: Record<string, unknown> = {};

    if (parsed.data.name) {
      updateData.name = parsed.data.name;
      updateData.slug = generateSlug(parsed.data.name);

      const [slugConflict] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, updateData.slug as string))
        .limit(1);

      if (slugConflict && slugConflict.id !== categoryId) {
        return NextResponse.json(
          { error: "Ja existe uma categoria com esse slug" },
          { status: 409 }
        );
      }
    }

    updateData.updatedAt = new Date().toISOString();

    const [updated] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, categoryId))
      .returning();

    revalidateTag("categories");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/categories/:id]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    const [postCount] = await db
      .select({ total: count() })
      .from(posts)
      .where(eq(posts.categoryId, categoryId));

    if (postCount.total > 0) {
      return NextResponse.json(
        {
          error: `Nao e possivel excluir: existem ${postCount.total} post(s) vinculados a esta categoria`,
        },
        { status: 409 }
      );
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidateTag("categories");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/categories/:id]", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}
