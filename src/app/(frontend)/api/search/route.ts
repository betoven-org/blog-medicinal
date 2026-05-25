import { NextRequest, NextResponse } from "next/server";
import { cms } from "@/lib/cms";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const result = await cms.posts.list({ search: q, limit: 8 });

  const results = result.docs.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
  }));

  return NextResponse.json(results);
}
