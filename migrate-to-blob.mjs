/**
 * Migrates local media files to Vercel Blob and updates DB URLs.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx node migrate-to-blob.mjs
 *
 * Run this ONCE after setting up Vercel Blob storage.
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";
import pg from "pg";

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
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN env var");
  process.exit(1);
}

async function run() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();

  const mediaRows = await client.query("SELECT id, filename, url, sizes_thumbnail_filename, sizes_card_filename, sizes_hero_filename FROM media");
  console.log(`Migrating ${mediaRows.rows.length} media records...`);

  let done = 0;

  for (const row of mediaRows.rows) {
    try {
      const updates = {};

      // Upload original
      if (row.filename) {
        const filePath = path.join(MEDIA_DIR, row.filename);
        const buffer = readFileSync(filePath);
        const blob = await put(`media/${row.filename}`, buffer, { access: "public", token: TOKEN });
        updates.url = blob.url;
      }

      // Upload sizes
      const sizeFields = [
        { filenameCol: "sizes_thumbnail_filename", urlCol: "sizes_thumbnail_url", thumbUrlCol: "thumbnail_u_r_l" },
        { filenameCol: "sizes_card_filename", urlCol: "sizes_card_url" },
        { filenameCol: "sizes_hero_filename", urlCol: "sizes_hero_url" },
      ];

      for (const sf of sizeFields) {
        const fn = row[sf.filenameCol];
        if (fn) {
          const filePath = path.join(MEDIA_DIR, fn);
          const buffer = readFileSync(filePath);
          const blob = await put(`media/${fn}`, buffer, { access: "public", token: TOKEN });
          updates[sf.urlCol] = blob.url;
          if (sf.thumbUrlCol) updates[sf.thumbUrlCol] = blob.url;
        }
      }

      // Build SQL update
      const setClauses = Object.entries(updates).map(([col, _], i) => `${col} = $${i + 2}`);
      if (setClauses.length > 0) {
        const values = [row.id, ...Object.values(updates)];
        await client.query(`UPDATE media SET ${setClauses.join(", ")} WHERE id = $1`, values);
      }

      done++;
      console.log(`  [${done}/${mediaRows.rows.length}] ${row.filename}`);
    } catch (err) {
      console.warn(`  Error migrating ${row.filename}: ${err.message}`);
    }
  }

  await client.end();
  console.log(`\nDone! Migrated ${done} media files to Vercel Blob.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
