/**
 * Seed script — imports posts from spreadsheet into PostgreSQL.
 * Images are stored as external URLs (Framer CDN), not uploaded locally.
 *
 * Usage: node seed.mjs
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import pg from "pg";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envContent = readFileSync(path.resolve(__dirname, ".env"), "utf-8");
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1);
}

const SPREADSHEET = path.resolve(process.env.HOME, "Downloads/medicinal_blog_posts.xlsx");

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00.000Z`).toISOString();
  }
  return new Date().toISOString();
}

function makeLexicalContent(text) {
  return JSON.stringify({
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: text || "", version: 1 }],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  });
}

async function run() {
  const wb = XLSX.readFile(SPREADSHEET);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`Read ${rows.length} rows from spreadsheet`);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();

  // 1. Clean existing data (order matters for FK constraints)
  console.log("Cleaning existing data...");
  await client.query("DELETE FROM posts_tags");
  await client.query("DELETE FROM payload_locked_documents_rels");
  await client.query("DELETE FROM payload_locked_documents");
  await client.query("DELETE FROM posts");
  await client.query("DELETE FROM media");
  await client.query("DELETE FROM authors");
  await client.query("DELETE FROM categories");

  // Reset sequences
  await client.query("ALTER SEQUENCE posts_id_seq RESTART WITH 1");
  await client.query("ALTER SEQUENCE media_id_seq RESTART WITH 1");
  await client.query("ALTER SEQUENCE authors_id_seq RESTART WITH 1");
  await client.query("ALTER SEQUENCE categories_id_seq RESTART WITH 1");
  console.log("  Done");

  // 2. Create categories
  console.log("Creating categories...");
  const uniqueCategories = [...new Set(rows.map((r) => r.Category).filter(Boolean))];
  const categoryMap = {};
  for (const name of uniqueCategories) {
    const slug = slugify(name);
    const res = await client.query(
      "INSERT INTO categories (name, slug, updated_at, created_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id",
      [name, slug]
    );
    categoryMap[name] = res.rows[0].id;
    console.log(`  ${name} (id: ${res.rows[0].id})`);
  }

  // 3. Create author
  console.log("Creating author...");
  const authorRes = await client.query(
    "INSERT INTO authors (name, bio, updated_at, created_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id",
    ["Equipe Atendimento Medicinal", "Equipe de conteudo do blog Medicinal."]
  );
  const authorId = authorRes.rows[0].id;
  console.log(`  id: ${authorId}`);

  // 4. Create media records (external URLs only, no file upload)
  console.log("Creating media from external URLs...");
  const mediaMap = {}; // imageUrl -> mediaId
  for (const row of rows) {
    const url = row["Cover Image URL"];
    if (!url || mediaMap[url]) continue;

    const alt = row["Cover Image Alt"] || row.Title;
    const filename = url.split("/").pop() || "image.png";

    const res = await client.query(
      `INSERT INTO media (alt, url, filename, mime_type, updated_at, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
      [alt, url, filename, "image/png"]
    );
    mediaMap[url] = res.rows[0].id;
  }
  console.log(`  Created ${Object.keys(mediaMap).length} media records`);

  // 5. Create posts
  console.log("Creating posts...");
  let created = 0;

  for (const row of rows) {
    const title = row.Title;
    if (!title) continue;

    const slug = row.Slug || slugify(title);
    const excerpt = row.Excerpt || row["Meta Description"] || "";
    const content = makeLexicalContent(excerpt);
    const categoryId = categoryMap[row.Category] || Object.values(categoryMap)[0];
    const heroImageId = row["Cover Image URL"] ? mediaMap[row["Cover Image URL"]] : null;
    const publishedAt = parseDate(row["Published Date"]);

    const postRes = await client.query(
      `INSERT INTO posts (title, slug, excerpt, hero_image_id, content, category_id, author_id, status, featured, published_at, updated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
      [title, slug, excerpt, heroImageId, content, categoryId, authorId, "published", false, publishedAt]
    );
    const postId = postRes.rows[0].id;

    // Insert tags
    const tags = row.Tags
      ? row.Tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    let tagOrder = 0;
    for (const tag of tags) {
      await client.query(
        "INSERT INTO posts_tags (id, _parent_id, _order, tag) VALUES ($1, $2, $3, $4)",
        [crypto.randomUUID(), postId, tagOrder++, tag]
      );
    }

    created++;
    if (created % 20 === 0 || created === rows.length) {
      console.log(`  ${created}/${rows.length}`);
    }
  }

  await client.end();
  console.log(`\nDone! ${created} posts created with external image URLs.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
