import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  categories, authors, posts, tags, media, products, subscribers,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { generateSlug } from "@/lib/slug";

// ── Helpers ─────────────────────────────────────────────────────────────────────

async function getOrCreateMedia(url: string, alt: string): Promise<number> {
  const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.supabaseUrl, url)).limit(1);
  if (existing) return existing.id;
  const filename = url.split("/").pop() || "image";
  const [created] = await db.insert(media).values({ supabaseUrl: url, filename, alt, url, createdAt: new Date().toISOString() }).returning({ id: media.id });
  return created.id;
}

async function getOrCreateAuthor(name: string): Promise<number> {
  const slug = generateSlug(name);
  const [existing] = await db.select({ id: authors.id }).from(authors).where(eq(authors.slug, slug)).limit(1);
  if (existing) return existing.id;
  const now = new Date().toISOString();
  const [created] = await db.insert(authors).values({ name, slug, createdAt: now, updatedAt: now }).returning({ id: authors.id });
  return created.id;
}

async function getCategoryLocalId(supabaseId: string): Promise<number | null> {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.supabaseId, supabaseId)).limit(1);
  return row?.id ?? null;
}

// ── Auth ────────────────────────────────────────────────────────────────────────

function verifySecret(request: NextRequest): boolean {
  const header = request.headers.get("x-supabase-webhook-secret");
  if (!header) return false;
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  return !!secret && header === secret;
}

// ── Webhook payload ─────────────────────────────────────────────────────────────

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

// ── POST handler ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Webhook secret invalido" }, { status: 401 });
  }

  try {
    const payload: WebhookPayload = await request.json();
    const { type, table, record, old_record } = payload;

    switch (table) {
      case "categories":
        await handleCategory(type, record, old_record);
        revalidateTag("categories");
        break;

      case "articles":
        await handleArticle(type, record, old_record);
        revalidateTag("posts");
        break;

      case "products":
        await handleProduct(type, record, old_record);
        revalidateTag("products");
        break;

      case "article_tags":
        await handleArticleTag(type, record, old_record);
        revalidateTag("posts");
        break;

      case "newsletter_subscribers":
        await handleSubscriber(type, record, old_record);
        break;

      default:
        return NextResponse.json({ ignored: true, table }, { status: 200 });
    }

    return NextResponse.json({ received: true, table, type });
  } catch (error) {
    console.error("[Webhook supabase-sync]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no webhook" },
      { status: 500 },
    );
  }
}

// ── Category handler ────────────────────────────────────────────────────────────

async function handleCategory(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const sbId = old_record?.id as string;
    if (!sbId) return;
    const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.supabaseId, sbId)).limit(1);
    if (existing) await db.delete(categories).where(eq(categories.id, existing.id));
    return;
  }

  if (!record) return;
  const sbId = record.id as string;
  const now = new Date().toISOString();

  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.supabaseId, sbId)).limit(1);
  if (existing) {
    await db.update(categories).set({
      name: record.name as string,
      slug: record.slug as string,
      description: (record.description as string) || null,
      updatedAt: now,
    }).where(eq(categories.id, existing.id));
  } else {
    await db.insert(categories).values({
      supabaseId: sbId,
      name: record.name as string,
      slug: record.slug as string,
      description: (record.description as string) || null,
      createdAt: (record.created_at as string) || now,
      updatedAt: now,
    });
  }
}

// ── Article handler ─────────────────────────────────────────────────────────────

async function handleArticle(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const sbId = old_record?.id as string;
    if (!sbId) return;
    const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.supabaseId, sbId)).limit(1);
    if (existing) {
      await db.delete(tags).where(eq(tags.postId, existing.id));
      await db.delete(posts).where(eq(posts.id, existing.id));
    }
    return;
  }

  if (!record) return;
  const sbId = record.id as string;
  const categoryId = record.category_id ? await getCategoryLocalId(record.category_id as string) : null;
  const authorId = record.author_name ? await getOrCreateAuthor(record.author_name as string) : null;
  let heroImageId: number | null = null;
  if (record.cover_image_url) {
    heroImageId = await getOrCreateMedia(
      record.cover_image_url as string,
      (record.cover_image_alt as string) || (record.title as string),
    );
  }
  const content = record.content ? { type: "doc", _html: record.content as string } : null;
  const status: "draft" | "published" = record.status === "published" ? "published" : "draft";

  const postData = {
    title: record.title as string,
    slug: record.slug as string,
    excerpt: (record.excerpt as string) || null,
    content,
    categoryId,
    authorId,
    heroImageId,
    coverUrl: (record.cover_image_url as string) || null,
    metaTitle: (record.meta_title as string) || null,
    metaDescription: (record.meta_description as string) || null,
    focusKeyword: (record.focus_keyword as string) || null,
    secondaryKeywords: (record.secondary_keywords as string) || null,
    ogTitle: (record.og_title as string) || null,
    ogDescription: (record.og_description as string) || null,
    ogImageUrl: (record.og_image_url as string) || null,
    schemaType: (record.schema_type as string) || null,
    canonicalUrl: (record.canonical_url as string) || null,
    wordCount: (record.word_count as number) || null,
    readingTimeMinutes: (record.reading_time_minutes as number) || null,
    seoScore: (record.seo_score as number) || null,
    seoNotes: (record.seo_notes as string) || null,
    lastSeoReviewAt: (record.last_seo_review_at as string) || null,
    approvedAt: (record.approved_at as string) || null,
    status,
    publishedAt: (record.published_at as string) || (record.published_date as string) || null,
    updatedAt: (record.updated_at as string) || new Date().toISOString(),
  };

  const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.supabaseId, sbId)).limit(1);
  if (existing) {
    await db.update(posts).set(postData).where(eq(posts.id, existing.id));
  } else {
    await db.insert(posts).values({
      supabaseId: sbId,
      ...postData,
      createdAt: (record.created_at as string) || new Date().toISOString(),
    });
  }
}

// ── Product handler ─────────────────────────────────────────────────────────────

async function handleProduct(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const slug = old_record?.slug as string;
    if (!slug) return;
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (existing) await db.delete(products).where(eq(products.id, existing.id));
    return;
  }

  if (!record) return;
  let imageId: number | null = null;
  if (record.cover_image_url) {
    imageId = await getOrCreateMedia(
      record.cover_image_url as string,
      (record.cover_image_alt as string) || (record.title as string),
    );
  }
  const content = record.content ? { type: "doc", _html: record.content as string } : null;
  const status: "draft" | "published" = record.status === "published" ? "published" : "draft";

  const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, record.slug as string)).limit(1);
  if (existing) {
    const updateData: Record<string, unknown> = {
      name: record.title as string,
      description: (record.excerpt as string) || null,
      content,
      seoTitle: (record.meta_title as string) || null,
      seoDescription: (record.meta_description as string) || null,
      status,
      updatedAt: (record.updated_at as string) || new Date().toISOString(),
    };
    if (imageId) updateData.imageId = imageId;
    await db.update(products).set(updateData).where(eq(products.id, existing.id));
  } else {
    await db.insert(products).values({
      name: record.title as string,
      slug: record.slug as string,
      description: (record.excerpt as string) || null,
      content,
      imageId,
      seoTitle: (record.meta_title as string) || null,
      seoDescription: (record.meta_description as string) || null,
      status,
      createdAt: (record.created_at as string) || new Date().toISOString(),
      updatedAt: (record.updated_at as string) || new Date().toISOString(),
    });
  }
}

// ── ArticleTag handler ──────────────────────────────────────────────────────────

async function handleArticleTag(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  const data = type === "DELETE" ? old_record : record;
  if (!data) return;

  const articleSbId = data.article_id as string;
  const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.supabaseId, articleSbId)).limit(1);
  if (!post) return;

  // Fetch tag name from Supabase
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sbUrl || !sbKey) return;

  const tagId = data.tag_id as string;
  const res = await fetch(`${sbUrl}/rest/v1/tags?id=eq.${tagId}&select=name&limit=1`, {
    headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
  });
  if (!res.ok) return;
  const tagRows = await res.json();
  const tagName = tagRows[0]?.name;
  if (!tagName) return;

  if (type === "DELETE") {
    // Remove specific tag
    const existingTags = await db.select({ id: tags.id, tag: tags.tag }).from(tags).where(eq(tags.postId, post.id));
    const toDelete = existingTags.find((t) => t.tag === tagName);
    if (toDelete) await db.delete(tags).where(eq(tags.id, toDelete.id));
  } else {
    // Add tag (avoid duplicate)
    const existingTags = await db.select({ tag: tags.tag }).from(tags).where(eq(tags.postId, post.id));
    if (!existingTags.some((t) => t.tag === tagName)) {
      await db.insert(tags).values({ postId: post.id, tag: tagName });
    }
  }
}

// ── Subscriber handler ──────────────────────────────────────────────────────────

async function handleSubscriber(
  type: string,
  record: Record<string, unknown> | null,
  old_record: Record<string, unknown> | null,
) {
  if (type === "DELETE") {
    const email = old_record?.email as string;
    if (!email) return;
    await db.delete(subscribers).where(eq(subscribers.email, email));
    return;
  }

  if (!record) return;
  const email = record.email as string;
  const name = (record.name as string) || null;
  const active = record.active !== false;

  const [existing] = await db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.email, email)).limit(1);
  if (existing) {
    await db.update(subscribers).set({ name, active }).where(eq(subscribers.id, existing.id));
  } else {
    await db.insert(subscribers).values({
      name,
      email,
      active,
      createdAt: (record.created_at as string) || new Date().toISOString(),
    });
  }
}
