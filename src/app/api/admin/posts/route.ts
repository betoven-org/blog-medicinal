import { auth } from "@/auth";
import { db } from "@/db";
import { posts, categories, authors, tags, media } from "@/db/schema";
import { eq, desc, like, and, count, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { generateSlug } from "@/lib/slug";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as "draft" | "published" | null;

    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(like(posts.title, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(posts.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [docs, totalResult] = await Promise.all([
      db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          status: posts.status,
          featured: posts.featured,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          coverUrl: posts.coverUrl,
          categoryId: posts.categoryId,
          categoryName: categories.name,
          authorId: posts.authorId,
          authorName: authors.name,
          heroImageId: posts.heroImageId,
          heroImageUrl: media.url,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .leftJoin(authors, eq(posts.authorId, authors.id))
        .leftJoin(media, eq(posts.heroImageId, media.id))
        .where(where)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(posts).where(where),
    ]);

    const totalDocs = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json({ docs, totalDocs, totalPages, page });
  } catch (error) {
    console.error("[GET /api/admin/posts]", error);
    return NextResponse.json(
      { error: "Erro ao listar posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const body = await req.json();
    const { title, excerpt, content, categoryId, authorId, heroImageId, coverUrl, status, featured, tags: postTags } = body;

    if (!title || !excerpt || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: "Campos obrigatorios: title, excerpt, content, categoryId, authorId" },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const existingSlug = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "Ja existe um post com esse slug" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const publishedAt =
      status === "published" ? now : undefined;

    const [created] = await db
      .insert(posts)
      .values({
        title,
        slug,
        excerpt,
        content,
        categoryId,
        authorId,
        heroImageId: heroImageId || null,
        coverUrl: coverUrl || null,
        status: status || "draft",
        featured: featured ?? false,
        publishedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (postTags && Array.isArray(postTags) && postTags.length > 0) {
      await db.insert(tags).values(
        postTags.map((tag: string) => ({
          postId: created.id,
          tag,
        }))
      );
    }

    revalidateTag("posts");

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/posts]", error);
    return NextResponse.json(
      { error: "Erro ao criar post" },
      { status: 500 }
    );
  }
}
