import { readFileSync } from "fs";

// Load .env manually
const envContent = readFileSync(new URL(".env", import.meta.url), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

import { getPayload } from "payload";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import https from "https";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPREADSHEET_PATH = path.resolve(
  process.env.HOME,
  "Downloads/medicinal_blog_posts.xlsx"
);

// Inline collections to avoid .ts import issues
const collections = [
  {
    slug: "users",
    auth: true,
    fields: [],
  },
  {
    slug: "authors",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "avatar", type: "upload", relationTo: "media" },
      { name: "bio", type: "textarea" },
    ],
  },
  {
    slug: "categories",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "text", required: true, unique: true },
    ],
  },
  {
    slug: "media",
    upload: {
      staticDir: path.resolve(__dirname, "public/media"),
      mimeTypes: ["image/*"],
      imageSizes: [
        { name: "thumbnail", width: 400, height: 300 },
        { name: "card", width: 768, height: 432 },
        { name: "hero", width: 1920, height: 800 },
      ],
    },
    fields: [{ name: "alt", type: "text", required: true }],
  },
  {
    slug: "posts",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "text", required: true, unique: true },
      { name: "excerpt", type: "textarea", required: true },
      { name: "heroImage", type: "upload", relationTo: "media" },
      { name: "content", type: "richText", required: true },
      { name: "category", type: "relationship", relationTo: "categories", required: true },
      { name: "author", type: "relationship", relationTo: "authors", required: true },
      { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
      {
        name: "status",
        type: "select",
        defaultValue: "draft",
        options: [
          { label: "Rascunho", value: "draft" },
          { label: "Publicado", value: "published" },
        ],
      },
      { name: "featured", type: "checkbox", defaultValue: false },
      { name: "publishedAt", type: "date" },
    ],
  },
];

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
  return {
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
  };
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function seed() {
  const config = buildConfig({
    secret: process.env.PAYLOAD_SECRET || "seed-secret-key-min-length-32-chars",
    collections,
    editor: lexicalEditor(),
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URI || "" },
    }),
    sharp,
    typescript: { outputFile: path.resolve(__dirname, "src/payload-types.ts") },
  });

  const payload = await getPayload({ config });

  // Read spreadsheet
  const wb = XLSX.readFile(SPREADSHEET_PATH);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`Read ${rows.length} rows from spreadsheet`);

  // 1. Delete existing data
  console.log("Cleaning existing data...");
  const existingPosts = await payload.find({ collection: "posts", limit: 1000 });
  for (const post of existingPosts.docs) {
    await payload.delete({ collection: "posts", id: post.id });
  }
  console.log(`  Deleted ${existingPosts.docs.length} posts`);

  const existingMedia = await payload.find({ collection: "media", limit: 1000 });
  for (const media of existingMedia.docs) {
    await payload.delete({ collection: "media", id: media.id });
  }
  console.log(`  Deleted ${existingMedia.docs.length} media`);

  const existingAuthors = await payload.find({ collection: "authors", limit: 1000 });
  for (const author of existingAuthors.docs) {
    await payload.delete({ collection: "authors", id: author.id });
  }
  console.log(`  Deleted ${existingAuthors.docs.length} authors`);

  const existingCats = await payload.find({ collection: "categories", limit: 1000 });
  for (const cat of existingCats.docs) {
    await payload.delete({ collection: "categories", id: cat.id });
  }
  console.log(`  Deleted ${existingCats.docs.length} categories`);

  // Clean leftover media files
  const mediaDir = path.resolve(__dirname, "public/media");
  if (fs.existsSync(mediaDir)) {
    fs.rmSync(mediaDir, { recursive: true, force: true });
    fs.mkdirSync(mediaDir, { recursive: true });
    console.log("  Cleaned public/media directory");
  }

  // 2. Create categories
  console.log("Creating categories...");
  const uniqueCategories = [...new Set(rows.map((r) => r.Category).filter(Boolean))];
  const categoryMap = {};
  for (const name of uniqueCategories) {
    const cat = await payload.create({
      collection: "categories",
      data: { name, slug: slugify(name) },
    });
    categoryMap[name] = cat.id;
    console.log(`  Created category: ${name}`);
  }

  // 3. Create author
  console.log("Creating author...");
  const author = await payload.create({
    collection: "authors",
    data: {
      name: "Equipe Atendimento Medicinal",
      bio: "Equipe de conteúdo do blog Medicinal.",
    },
  });
  console.log(`  Created author: ${author.name}`);

  // 4. Create posts with images
  console.log("Creating posts...");
  let created = 0;
  let imageErrors = 0;

  for (const row of rows) {
    const title = row.Title;
    if (!title) continue;

    let heroImageId = null;

    // Download and upload cover image
    if (row["Cover Image URL"]) {
      try {
        const buffer = await downloadFile(row["Cover Image URL"]);
        const ext = row["Cover Image URL"].match(/\.(png|jpg|jpeg|webp|gif)/i)?.[1] || "png";
        const tempPath = path.resolve(__dirname, `temp-seed-image.${ext}`);
        fs.writeFileSync(tempPath, buffer);

        const media = await payload.create({
          collection: "media",
          data: { alt: row["Cover Image Alt"] || title },
          filePath: tempPath,
        });
        heroImageId = media.id;
        fs.unlinkSync(tempPath);
      } catch (err) {
        console.warn(`  Warning: Failed to download image for "${title}": ${err.message}`);
        imageErrors++;
      }
    }

    // Parse tags
    const tags = row.Tags
      ? row.Tags.split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((tag) => ({ tag }))
      : [];

    const postData = {
      title,
      slug: row.Slug || slugify(title),
      excerpt: row.Excerpt || row["Meta Description"] || "",
      content: makeLexicalContent(row.Excerpt || row["Meta Description"] || ""),
      category: categoryMap[row.Category] || Object.values(categoryMap)[0],
      author: author.id,
      tags,
      status: "published",
      featured: false,
      publishedAt: parseDate(row["Published Date"]),
    };

    if (heroImageId) {
      postData.heroImage = heroImageId;
    }

    try {
      await payload.create({ collection: "posts", data: postData });
      created++;
      console.log(`  [${created}/${rows.length}] ${title}`);
    } catch (err) {
      console.error(`  Error creating post "${title}": ${err.message}`);
    }
  }

  console.log(`\nDone! Created ${created} posts (${imageErrors} image errors)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
