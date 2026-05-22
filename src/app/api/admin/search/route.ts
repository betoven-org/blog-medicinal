import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, categories, authors, products } from "@/db/schema";
import { like, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `%${q}%`;

  const [foundPosts, foundCategories, foundAuthors, foundProducts] =
    await Promise.all([
      db
        .select({ id: posts.id, title: posts.title, slug: posts.slug, status: posts.status })
        .from(posts)
        .where(like(posts.title, pattern))
        .orderBy(desc(posts.createdAt))
        .limit(5),
      db
        .select({ id: categories.id, name: categories.name, slug: categories.slug })
        .from(categories)
        .where(like(categories.name, pattern))
        .orderBy(desc(categories.createdAt))
        .limit(5),
      db
        .select({ id: authors.id, name: authors.name, slug: authors.slug })
        .from(authors)
        .where(like(authors.name, pattern))
        .orderBy(desc(authors.createdAt))
        .limit(5),
      db
        .select({ id: products.id, name: products.name, slug: products.slug })
        .from(products)
        .where(like(products.name, pattern))
        .orderBy(desc(products.createdAt))
        .limit(5),
    ]);

  const results = [
    ...foundPosts.map((p) => ({
      type: "post" as const,
      id: p.id,
      label: p.title,
      href: `/admin/posts/${p.id}`,
      meta: p.status,
    })),
    ...foundCategories.map((c) => ({
      type: "category" as const,
      id: c.id,
      label: c.name,
      href: `/admin/categorias/${c.id}`,
    })),
    ...foundAuthors.map((a) => ({
      type: "author" as const,
      id: a.id,
      label: a.name,
      href: `/admin/autores/${a.id}`,
    })),
    ...foundProducts.map((p) => ({
      type: "product" as const,
      id: p.id,
      label: p.name,
      href: `/admin/produtos/${p.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
