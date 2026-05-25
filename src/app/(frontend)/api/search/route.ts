import { NextRequest, NextResponse } from "next/server";
import { db } from "@brasa/core/db";
import { posts, categories, authors } from "@brasa/core/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const tenantId = await getTenantId();
  const pattern = `%${q}%`;

  const results = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.tenantId, tenantId),
        eq(posts.status, "published"),
        or(ilike(posts.title, pattern), ilike(posts.excerpt, pattern))
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(8);

  return NextResponse.json(results);
}
