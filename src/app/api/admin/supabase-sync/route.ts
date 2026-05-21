import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  siteSettings,
  categories,
  authors,
  posts,
  tags,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toTipTapJson(raw: unknown): object {
  if (typeof raw === "string") {
    return {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: raw }] },
      ],
    };
  }
  if (raw && typeof raw === "object") return raw as object;
  return { type: "doc", content: [] };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getSupabaseSettings() {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 1),
  });
  if (!row?.supabaseUrl || !row?.supabaseServiceRoleKey) {
    return null;
  }
  return {
    url: row.supabaseUrl,
    serviceRoleKey: row.supabaseServiceRoleKey,
  };
}

// ---------------------------------------------------------------------------
// Resolve category / author by flexible reference (id, name, slug)
// ---------------------------------------------------------------------------

async function resolveCategoryId(
  ref: unknown,
): Promise<number | null> {
  if (!ref) return null;

  if (typeof ref === "number") {
    const found = await db.query.categories.findFirst({
      where: eq(categories.id, ref),
    });
    return found?.id ?? null;
  }

  const str = String(ref);
  // Try by slug first, then by name
  const bySlug = await db.query.categories.findFirst({
    where: eq(categories.slug, slugify(str)),
  });
  if (bySlug) return bySlug.id;

  const byName = await db.query.categories.findFirst({
    where: eq(categories.name, str),
  });
  return byName?.id ?? null;
}

async function resolveAuthorId(
  ref: unknown,
): Promise<number | null> {
  if (!ref) return null;

  if (typeof ref === "number") {
    const found = await db.query.authors.findFirst({
      where: eq(authors.id, ref),
    });
    return found?.id ?? null;
  }

  const str = String(ref);
  const bySlug = await db.query.authors.findFirst({
    where: eq(authors.slug, slugify(str)),
  });
  if (bySlug) return bySlug.id;

  const byName = await db.query.authors.findFirst({
    where: eq(authors.name, str),
  });
  return byName?.id ?? null;
}

// ---------------------------------------------------------------------------
// POST — Full sync from client Supabase → Neon
// ---------------------------------------------------------------------------

export async function POST() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const config = await getSupabaseSettings();
  if (!config)
    return NextResponse.json(
      { error: "Credenciais do Supabase nao configuradas." },
      { status: 400 },
    );

  try {
    const supabase = createClient(config.url, config.serviceRoleKey);

    // 1. Sync categories
    const { data: sbCategories, error: catErr } = await supabase
      .from("categories")
      .select("*");

    if (catErr) throw new Error(`Erro ao buscar categories: ${catErr.message}`);

    let categoriesSynced = 0;
    for (const cat of sbCategories ?? []) {
      const slug = cat.slug || slugify(cat.name);
      await db
        .insert(categories)
        .values({
          name: cat.name,
          slug,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: cat.name,
            updatedAt: new Date().toISOString(),
          },
        });
      categoriesSynced++;
    }

    // 2. Sync authors
    const { data: sbAuthors, error: authErr } = await supabase
      .from("authors")
      .select("*");

    if (authErr) throw new Error(`Erro ao buscar authors: ${authErr.message}`);

    let authorsSynced = 0;
    for (const author of sbAuthors ?? []) {
      const slug = author.slug || slugify(author.name);
      await db
        .insert(authors)
        .values({
          name: author.name,
          slug,
          bio: author.bio || null,
        })
        .onConflictDoUpdate({
          target: authors.slug,
          set: {
            name: author.name,
            bio: author.bio || null,
            updatedAt: new Date().toISOString(),
          },
        });
      authorsSynced++;
    }

    // 3. Sync posts
    const { data: sbPosts, error: postErr } = await supabase
      .from("posts")
      .select("*");

    if (postErr) throw new Error(`Erro ao buscar posts: ${postErr.message}`);

    let postsSynced = 0;
    for (const post of sbPosts ?? []) {
      const categoryRef = post.category_id ?? post.category ?? null;
      const authorRef = post.author_id ?? post.author ?? null;

      const categoryId = await resolveCategoryId(categoryRef);
      const authorId = await resolveAuthorId(authorRef);

      if (!categoryId || !authorId) {
        // Skip posts with unresolvable references
        continue;
      }

      const slug = post.slug || slugify(post.title);
      const content = toTipTapJson(post.content);
      const status = post.status === "published" ? "published" : "draft";

      await db
        .insert(posts)
        .values({
          title: post.title,
          slug,
          excerpt: post.excerpt || "",
          content,
          categoryId,
          authorId,
          coverUrl: post.cover_image_url || null,
          status,
          publishedAt: post.published_at || null,
        })
        .onConflictDoUpdate({
          target: posts.slug,
          set: {
            title: post.title,
            excerpt: post.excerpt || "",
            content,
            categoryId,
            authorId,
            coverUrl: post.cover_image_url || null,
            status,
            publishedAt: post.published_at || null,
            updatedAt: new Date().toISOString(),
          },
        });

      // Sync tags for this post
      if (post.tags) {
        // Get the post ID
        const existingPost = await db.query.posts.findFirst({
          where: eq(posts.slug, slug),
        });

        if (existingPost) {
          // Clear existing tags
          await db.delete(tags).where(eq(tags.postId, existingPost.id));

          // Parse tags (array or comma-separated string)
          const tagList: string[] = Array.isArray(post.tags)
            ? post.tags
            : String(post.tags)
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean);

          for (const tag of tagList) {
            await db.insert(tags).values({
              postId: existingPost.id,
              tag,
            });
          }
        }
      }

      postsSynced++;
    }

    revalidateTag("posts");
    revalidateTag("categories");
    revalidateTag("authors");

    return NextResponse.json({
      synced: {
        posts: postsSynced,
        categories: categoriesSynced,
        authors: authorsSynced,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido na sincronizacao.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — Clear all content data from Neon
// ---------------------------------------------------------------------------

export async function DELETE() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    // Delete in FK-safe order: tags → posts → authors → categories
    await db.delete(tags);
    await db.delete(posts);
    await db.delete(authors);
    await db.delete(categories);

    revalidateTag("posts");
    revalidateTag("categories");
    revalidateTag("authors");

    return NextResponse.json({ cleared: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao limpar dados.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
