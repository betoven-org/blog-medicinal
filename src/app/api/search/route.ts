import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, products, media } from "@/db/schema";
import { ilike, desc, eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], posts: [] });
  }

  const pattern = `%${q}%`;

  const [foundProducts, foundPosts] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        imageUrl: media.url,
      })
      .from(products)
      .leftJoin(media, eq(products.imageId, media.id))
      .where(and(ilike(products.name, pattern), eq(products.status, "published")))
      .orderBy(desc(products.createdAt))
      .limit(6),
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        coverUrl: posts.coverUrl,
      })
      .from(posts)
      .where(and(
        eq(posts.status, "published"),
        ilike(posts.title, pattern),
      ))
      .orderBy(desc(posts.createdAt))
      .limit(4),
  ]);

  return NextResponse.json({
    products: foundProducts.map((p) => ({
      id: p.id,
      name: p.name,
      href: `/${p.slug}/p`,
      imageUrl: p.imageUrl,
    })),
    posts: foundPosts.map((p) => ({
      id: p.id,
      title: p.title,
      href: `/posts/${p.slug}`,
      imageUrl: p.coverUrl,
    })),
  });
}
