import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as XLSX from "xlsx";
import { resolve } from "path";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URI;
if (!DATABASE_URL) {
  console.error("DATABASE_URL or DATABASE_URI is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseDate(dateStr: string): string {
  // Format: "21/04/2026" or "31/10/2025"
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`).toISOString();
  }
  return new Date().toISOString();
}

async function seed() {
  const filePath = resolve(process.env.HOME!, "Downloads/medicinal_blog_posts.xlsx");
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);

  console.log(`Found ${rows.length} posts in spreadsheet`);

  // 1. Extract unique categories and authors
  const categoryNames = [...new Set(rows.map((r) => r.Category).filter(Boolean))] as string[];
  const authorNames = [...new Set(rows.map((r) => r.Author).filter(Boolean))] as string[];

  // 2. Insert categories
  console.log(`Inserting ${categoryNames.length} categories...`);
  const categoryMap = new Map<string, number>();

  for (const name of categoryNames) {
    const slug = generateSlug(name);
    const existing = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      categoryMap.set(name, existing[0].id);
      console.log(`  Category "${name}" already exists (id: ${existing[0].id})`);
    } else {
      const [inserted] = await db
        .insert(schema.categories)
        .values({ name, slug })
        .returning({ id: schema.categories.id });
      categoryMap.set(name, inserted.id);
      console.log(`  Created category "${name}" (id: ${inserted.id})`);
    }
  }

  // 3. Insert authors
  console.log(`Inserting ${authorNames.length} authors...`);
  const authorMap = new Map<string, number>();

  for (const name of authorNames) {
    const slug = generateSlug(name);
    const existing = await db
      .select({ id: schema.authors.id })
      .from(schema.authors)
      .where(eq(schema.authors.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      authorMap.set(name, existing[0].id);
      console.log(`  Author "${name}" already exists (id: ${existing[0].id})`);
    } else {
      const [inserted] = await db
        .insert(schema.authors)
        .values({ name, slug })
        .returning({ id: schema.authors.id });
      authorMap.set(name, inserted.id);
      console.log(`  Created author "${name}" (id: ${inserted.id})`);
    }
  }

  // 4. Insert posts
  console.log(`Inserting ${rows.length} posts...`);
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const slug = row.Slug || generateSlug(row.Title);

    // Check if post already exists
    const existing = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const categoryId = categoryMap.get(row.Category) || categoryMap.values().next().value!;
    const authorId = authorMap.get(row.Author) || authorMap.values().next().value!;
    const publishedAt = row["Published Date"] ? parseDate(row["Published Date"]) : new Date().toISOString();

    // Create minimal TipTap content from excerpt (since we don't have full content)
    const content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: row.Excerpt || row["Meta Description"] || "" }],
        },
      ],
    };

    const tagList = row.Tags
      ? String(row.Tags).split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const [inserted] = await db
      .insert(schema.posts)
      .values({
        title: row.Title,
        slug,
        excerpt: row.Excerpt || row["Meta Description"] || "",
        content,
        categoryId,
        authorId,
        coverUrl: row["Cover Image URL"] || null,
        status: "published",
        featured: false,
        publishedAt,
      })
      .returning({ id: schema.posts.id });

    // Insert tags
    if (tagList.length > 0) {
      await db.insert(schema.tags).values(
        tagList.map((tag: string) => ({ postId: inserted.id, tag })),
      );
    }

    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped (already exists): ${skipped}`);
}

seed().catch(console.error);
