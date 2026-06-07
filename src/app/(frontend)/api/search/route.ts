import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], posts: [] });
  }

  const [postsResult, productsResult] = await Promise.all([
    cms.posts.list({ search: q, limit: 8 }),
    cms.products.list({ limit: 50 }),
  ]);

  const queryLower = q.toLowerCase();

  const posts = postsResult.docs.map((post) => ({
    id: post.id,
    title: post.title,
    href: `/posts/${post.slug}`,
  }));

  const products = productsResult.docs
    .filter((p) =>
      p.name.toLowerCase().includes(queryLower) ||
      (p.description && p.description.toLowerCase().includes(queryLower))
    )
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      href: `/${p.slug}/p`,
      imageUrl: p.image?.url ?? null,
    }));

  return NextResponse.json({ products, posts }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
