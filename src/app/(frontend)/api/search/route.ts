import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, categories } from "@/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json({ docs: [] });

  const searchPattern = `%${q}%`;

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(
      and(
        eq(posts.status, "published"),
        or(ilike(posts.title, searchPattern), ilike(posts.excerpt, searchPattern)),
      ),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(10);

  return NextResponse.json({
    docs: rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      category: r.categoryName ?? null,
    })),
  });
}
