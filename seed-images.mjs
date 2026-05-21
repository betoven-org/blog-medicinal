import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";
import XLSX from "xlsx";
import pg from "pg";
import sharp from "sharp";

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

const MEDIA_DIR = path.resolve(__dirname, "public/media");
const SPREADSHEET = path.resolve(process.env.HOME, "Downloads/medicinal_blog_posts.xlsx");

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function processImage(buffer, filename) {
  const baseName = filename;
  const ext = ".webp";

  const metadata = await sharp(buffer).metadata();

  // Save original as webp
  const originalName = `${baseName}${ext}`;
  await sharp(buffer).webp({ quality: 85 }).toFile(path.join(MEDIA_DIR, originalName));
  const originalSize = readFileSync(path.join(MEDIA_DIR, originalName)).length;

  // Generate sizes
  const sizes = {};
  const sizeDefs = [
    { name: "thumbnail", width: 400, height: 300 },
    { name: "card", width: 768, height: 432 },
    { name: "hero", width: 1920, height: 800 },
  ];

  for (const def of sizeDefs) {
    const sizeName = `${baseName}-${def.width}x${def.height}${ext}`;
    try {
      const resized = await sharp(buffer)
        .resize(def.width, def.height, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(path.join(MEDIA_DIR, sizeName));
      sizes[def.name] = {
        filename: sizeName,
        width: resized.width,
        height: resized.height,
        filesize: resized.size,
        mimeType: "image/webp",
        url: `/media/${sizeName}`,
      };
    } catch {
      sizes[def.name] = null;
    }
  }

  return {
    filename: originalName,
    mimeType: "image/webp",
    width: metadata.width,
    height: metadata.height,
    filesize: originalSize,
    url: `/media/${originalName}`,
    sizes,
  };
}

async function run() {
  mkdirSync(MEDIA_DIR, { recursive: true });

  const wb = XLSX.readFile(SPREADSHEET);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();

  // Get existing posts — match by slug prefix (spreadsheet slugs may be truncated)
  const postsResult = await client.query("SELECT id, slug FROM posts");
  const allPosts = postsResult.rows;

  function findPostId(spreadsheetSlug) {
    // Exact match first
    const exact = allPosts.find((p) => p.slug === spreadsheetSlug);
    if (exact) return exact.id;
    // Prefix match (spreadsheet slug might be truncated)
    const prefix = allPosts.find((p) => p.slug.startsWith(spreadsheetSlug));
    if (prefix) return prefix.id;
    return null;
  }

  const rowsWithImages = rows.filter((r) => r["Cover Image URL"] && r.Slug);
  console.log(`Processing ${rowsWithImages.length} images...`);

  let done = 0;
  let errors = 0;

  for (const row of rowsWithImages) {
    const postId = findPostId(row.Slug);
    if (!postId) {
      console.warn(`  No post for slug: ${row.Slug}`);
      errors++;
      continue;
    }

    try {
      const buffer = await downloadFile(row["Cover Image URL"]);
      const imgFilename = slugify(row.Title || row.Slug).slice(0, 80);
      const imgData = await processImage(buffer, imgFilename);
      const alt = row["Cover Image Alt"] || row.Title;
      const now = new Date().toISOString();

      const thumb = imgData.sizes.thumbnail;
      const card = imgData.sizes.card;
      const hero = imgData.sizes.hero;

      const mediaResult = await client.query(
        `INSERT INTO media (
          alt, filename, mime_type, filesize, width, height, url,
          thumbnail_u_r_l,
          sizes_thumbnail_url, sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_mime_type, sizes_thumbnail_filesize, sizes_thumbnail_filename,
          sizes_card_url, sizes_card_width, sizes_card_height, sizes_card_mime_type, sizes_card_filesize, sizes_card_filename,
          sizes_hero_url, sizes_hero_width, sizes_hero_height, sizes_hero_mime_type, sizes_hero_filesize, sizes_hero_filename,
          updated_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26,
          $27, $28
        ) RETURNING id`,
        [
          alt,
          imgData.filename,
          imgData.mimeType,
          imgData.filesize,
          imgData.width,
          imgData.height,
          imgData.url,
          thumb ? thumb.url : null,
          thumb ? thumb.url : null, thumb ? thumb.width : null, thumb ? thumb.height : null, thumb ? thumb.mimeType : null, thumb ? thumb.filesize : null, thumb ? thumb.filename : null,
          card ? card.url : null, card ? card.width : null, card ? card.height : null, card ? card.mimeType : null, card ? card.filesize : null, card ? card.filename : null,
          hero ? hero.url : null, hero ? hero.width : null, hero ? hero.height : null, hero ? hero.mimeType : null, hero ? hero.filesize : null, hero ? hero.filename : null,
          now, now,
        ]
      );

      const mediaId = mediaResult.rows[0].id;
      await client.query("UPDATE posts SET hero_image_id = $1 WHERE id = $2", [mediaId, postId]);

      done++;
      console.log(`  [${done}/${rowsWithImages.length}] ${row.Title}`);
    } catch (err) {
      errors++;
      console.warn(`  Error: ${row.Title} — ${err.message}`);
    }
  }

  await client.end();
  console.log(`\nDone! ${done} images uploaded, ${errors} errors.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
