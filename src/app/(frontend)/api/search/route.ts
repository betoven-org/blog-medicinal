import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload-utils';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) return NextResponse.json({ docs: [] });

  const payload = await getPayloadClient();
  const results = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        {
          or: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
      ],
    },
    limit: 10,
    depth: 1,
    sort: '-publishedAt',
  });

  return NextResponse.json({
    docs: results.docs.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      category: typeof p.category === 'object' && p.category !== null ? (p.category as { name?: string }).name ?? null : null,
    })),
  });
}
