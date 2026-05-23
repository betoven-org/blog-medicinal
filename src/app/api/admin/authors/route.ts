import { auth } from "@/auth";
import { db } from "@/db";
import { authors, media } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { generateSlug } from "@/lib/slug";
import { parseBody, createAuthorSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const docs = await db
      .select({
        id: authors.id,
        name: authors.name,
        slug: authors.slug,
        bio: authors.bio,
        avatarId: authors.avatarId,
        avatarUrl: media.url,
        avatarAlt: media.alt,
        createdAt: authors.createdAt,
        updatedAt: authors.updatedAt,
      })
      .from(authors)
      .leftJoin(media, eq(authors.avatarId, media.id))
      .orderBy(asc(authors.name));

    return NextResponse.json({ docs });
  } catch (error) {
    console.error("[GET /api/admin/authors]", error);
    return NextResponse.json(
      { error: "Erro ao listar autores" },
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
    const parsed = parseBody(createAuthorSchema, body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { name, bio, avatarId } = parsed.data;

    const slug = generateSlug(name);

    const [existingSlug] = await db
      .select({ id: authors.id })
      .from(authors)
      .where(eq(authors.slug, slug))
      .limit(1);

    if (existingSlug) {
      return NextResponse.json(
        { error: "Ja existe um autor com esse slug" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const [created] = await db
      .insert(authors)
      .values({
        name,
        slug,
        bio: bio || null,
        avatarId: avatarId || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    revalidateTag("authors");

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/authors]", error);
    return NextResponse.json(
      { error: "Erro ao criar autor" },
      { status: 500 }
    );
  }
}
