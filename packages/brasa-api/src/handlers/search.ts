import { NextRequest, NextResponse } from "next/server";
import { db } from "@brasa/core/db";
import { posts, products, media } from "@brasa/core/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { buildTsQuery } from "@brasa/core/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], posts: [] });
  }

  const tsq = buildTsQuery(q);
  const postRank = sql`ts_rank_cd(${posts.searchVector}, ${tsq})`;
  const productRank = sql`ts_rank_cd(${products.searchVector}, ${tsq})`;

  const ftsOrSimilarityPosts = sql`(
    ${posts.searchVector} @@ ${tsq}
    OR similarity(${posts.title}, ${q}) > 0.15
  )`;

  const ftsOrSimilarityProducts = sql`(
    ${products.searchVector} @@ ${tsq}
    OR similarity(${products.name}, ${q}) > 0.15
  )`;

  const [foundProducts, foundPosts] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        imageUrl: media.url,
        rank: productRank,
      })
      .from(products)
      .leftJoin(media, eq(products.imageId, media.id))
      .where(and(eq(products.status, "published"), ftsOrSimilarityProducts))
      .orderBy(sql`${productRank} DESC`)
      .limit(6),
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        coverUrl: posts.coverUrl,
        rank: postRank,
      })
      .from(posts)
      .where(and(eq(posts.status, "published"), ftsOrSimilarityPosts))
      .orderBy(sql`${postRank} DESC`)
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
