import { auth } from "@/auth";
import { db } from "@/db";
import { products, productCategories, media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { generateSlug } from "@/lib/slug";
import { parseBody, updateProductSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const productId = Number(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });

    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        content: products.content,
        composition: products.composition,
        usageInstructions: products.usageInstructions,
        whoCanUse: products.whoCanUse,
        benefits: products.benefits,
        differentials: products.differentials,
        productCategoryId: products.productCategoryId,
        categoryName: productCategories.name,
        categorySlug: productCategories.slug,
        imageId: products.imageId,
        imageUrl: media.url,
        imageAlt: media.alt,
        galleryImages: products.galleryImages,
        status: products.status,
        featured: products.featured,
        publishedAt: products.publishedAt,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(productCategories, eq(products.productCategoryId, productCategories.id))
      .leftJoin(media, eq(products.imageId, media.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (!product)
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/admin/products/:id]", error);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const productId = Number(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existing)
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });

    const body = await req.json();
    const parsed = parseBody(updateProductSchema, body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const updateData: Record<string, unknown> = {};

    if (parsed.data.name !== undefined && parsed.data.name !== existing.name) {
      updateData.name = parsed.data.name;
      updateData.slug = generateSlug(parsed.data.name);

      const [conflict] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, updateData.slug as string))
        .limit(1);

      if (conflict && conflict.id !== productId) {
        return NextResponse.json({ error: "Ja existe um produto com esse slug" }, { status: 409 });
      }
    }

    const fields = [
      "description", "seoTitle", "seoDescription", "content",
      "composition", "usageInstructions", "whoCanUse", "benefits",
      "differentials", "productCategoryId", "imageId", "galleryImages",
      "status", "featured", "brand", "isKit", "showOnSite",
    ] as const;

    for (const field of fields) {
      if (parsed.data[field] !== undefined) updateData[field] = parsed.data[field];
    }

    if (updateData.status === "published" && existing.status !== "published" && !existing.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    updateData.updatedAt = new Date().toISOString();

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    revalidateTag("products");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/products/:id]", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const productId = Number(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });

    await db.delete(products).where(eq(products.id, productId));

    revalidateTag("products");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/:id]", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
