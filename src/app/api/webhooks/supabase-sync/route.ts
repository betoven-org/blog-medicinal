import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, authors, posts, tags, siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

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

async function resolveCategoryId(ref: unknown): Promise<number | null> {
  if (!ref) return null;
  if (typeof ref === "number") {
    const found = await db.query.categories.findFirst({
      where: eq(categories.id, ref),
    });
    return found?.id ?? null;
  }
  const str = String(ref);
  const bySlug = await db.query.categories.findFirst({
    where: eq(categories.slug, slugify(str)),
  });
  if (bySlug) return bySlug.id;
  const byName = await db.query.categories.findFirst({
    where: eq(categories.name, str),
  });
  return byName?.id ?? null;
}

async function resolveAuthorId(ref: unknown): Promise<number | null> {
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
// Verify webhook secret
// ---------------------------------------------------------------------------

async function verifyWebhookSecret(request: NextRequest): Promise<boolean> {
  const headerSecret = request.headers.get("x-supabase-webhook-secret");
  if (!headerSecret) return false;

  // Check env var first
  if (process.env.SUPABASE_WEBHOOK_SECRET) {
    return headerSecret === process.env.SUPABASE_WEBHOOK_SECRET;
  }

  // Fallback: check site_settings for a stored secret (future-proof)
  return false;
}

// ---------------------------------------------------------------------------
// Check if sync is enabled
// ---------------------------------------------------------------------------

async function isSyncEnabled(): Promise<boolean> {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 1),
  });
  return row?.supabaseSyncEnabled === true;
}

// ---------------------------------------------------------------------------
// POST — Receive Supabase Database Webhook
// ---------------------------------------------------------------------------

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const valid = await verifyWebhookSecret(request);
  if (!valid) {
    return NextResponse.json(
      { error: "Webhook secret invalido" },
      { status: 401 },
    );
  }

  // Check if sync is enabled
  const enabled = await isSyncEnabled();
  if (!enabled) {
    return NextResponse.json(
      { error: "Sincronizacao desativada" },
      { status: 403 },
    );
  }

  try {
    const payload: WebhookPayload = await request.json();
    const { type, table, record, old_record } = payload;

    switch (table) {
      case "categories":
        await handleCategory(type, record, old_record);
        revalidateTag("categories");
        break;

      case "authors":
        await handleAuthor(type, record, old_record);
        revalidateTag("authors");
        break;

      case "posts":
        await handlePost(type, record, old_record);
        revalidateTag("posts");
        break;

      default:
        return NextResponse.json(
          { error: `Tabela desconhecida: ${table}` },
          { status: 400 },
        );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro no webhook.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Table handlers
// ---------------------------------------------------------------------------

async function handleCategory(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const slug =
      (old_record?.slug as string) || slugify(old_record?.name as string);
    if (slug) {
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      });
      if (existing) {
        await db.delete(categories).where(eq(categories.id, existing.id));
      }
    }
    return;
  }

  if (!record) return;
  const slug = (record.slug as string) || slugify(record.name as string);

  await db
    .insert(categories)
    .values({
      name: record.name as string,
      slug,
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: record.name as string,
        updatedAt: new Date().toISOString(),
      },
    });
}

async function handleAuthor(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const slug =
      (old_record?.slug as string) || slugify(old_record?.name as string);
    if (slug) {
      const existing = await db.query.authors.findFirst({
        where: eq(authors.slug, slug),
      });
      if (existing) {
        await db.delete(authors).where(eq(authors.id, existing.id));
      }
    }
    return;
  }

  if (!record) return;
  const slug = (record.slug as string) || slugify(record.name as string);

  await db
    .insert(authors)
    .values({
      name: record.name as string,
      slug,
      bio: (record.bio as string) || null,
    })
    .onConflictDoUpdate({
      target: authors.slug,
      set: {
        name: record.name as string,
        bio: (record.bio as string) || null,
        updatedAt: new Date().toISOString(),
      },
    });
}

async function handlePost(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const slug =
      (old_record?.slug as string) || slugify(old_record?.title as string);
    if (slug) {
      const existing = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
      });
      if (existing) {
        await db.delete(tags).where(eq(tags.postId, existing.id));
        await db.delete(posts).where(eq(posts.id, existing.id));
      }
    }
    return;
  }

  if (!record) return;

  const categoryRef = record.category_id ?? record.category ?? null;
  const authorRef = record.author_id ?? record.author ?? null;
  const categoryId = await resolveCategoryId(categoryRef);
  const authorId = await resolveAuthorId(authorRef);

  if (!categoryId || !authorId) return;

  const slug = (record.slug as string) || slugify(record.title as string);
  const content = toTipTapJson(record.content);
  const status =
    (record.status as string) === "published" ? "published" : "draft";

  await db
    .insert(posts)
    .values({
      title: record.title as string,
      slug,
      excerpt: (record.excerpt as string) || "",
      content,
      categoryId,
      authorId,
      coverUrl: (record.cover_image_url as string) || null,
      status,
      publishedAt: (record.published_at as string) || null,
    })
    .onConflictDoUpdate({
      target: posts.slug,
      set: {
        title: record.title as string,
        excerpt: (record.excerpt as string) || "",
        content,
        categoryId,
        authorId,
        coverUrl: (record.cover_image_url as string) || null,
        status,
        publishedAt: (record.published_at as string) || null,
        updatedAt: new Date().toISOString(),
      },
    });

  // Handle tags
  const existingPost = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });

  if (existingPost && record.tags) {
    await db.delete(tags).where(eq(tags.postId, existingPost.id));

    const tagList: string[] = Array.isArray(record.tags)
      ? (record.tags as string[])
      : String(record.tags)
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
