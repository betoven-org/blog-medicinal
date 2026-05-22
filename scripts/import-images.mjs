import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import XLSX from 'xlsx';

// Load .env
const envContent = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = neon(process.env.DATABASE_URI);

function generateSlug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function run() {
  const wb = XLSX.readFile('/Users/wesleymoraesserafim/Downloads/2026-05-21T20_17_05Z_imagens_medicinalnaweb.xlsx');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]).filter(r => r.__EMPTY !== 'ID do produto');

  // 1. Group unique images per product (dedupe by prodId + imageId)
  const prodImages = new Map();
  for (const r of rows) {
    const prodId = r.__EMPTY;
    const imgId = r.__EMPTY_5;
    const url = r.__EMPTY_10;
    if (!prodId || !url) continue;

    const key = `${prodId}-${imgId}`;
    if (!prodImages.has(prodId)) prodImages.set(prodId, new Map());
    if (prodImages.get(prodId).has(key)) continue;

    prodImages.get(prodId).set(key, {
      imgId,
      name: r.__EMPTY_6 || `img-${imgId}`,
      label: r.__EMPTY_8 || '',
      position: r.__EMPTY_7 ?? 0,
      url,
    });
  }

  console.log(`Produtos com imagens: ${prodImages.size}`);

  // 2. Get product slug -> id map from DB
  const dbProducts = await sql`SELECT id, slug FROM products`;
  const slugToId = new Map(dbProducts.map(p => [p.slug, p.id]));

  // 3. Get VTEX product name -> slug map from spreadsheet
  const prodXlsx = XLSX.readFile('/Users/wesleymoraesserafim/Downloads/2026-05-21T20_07_08Z_produtos-e-skus_medicinalnaweb.xlsx');
  const prodRows = XLSX.utils.sheet_to_json(prodXlsx.Sheets[prodXlsx.SheetNames[0]]).filter(r => r.__EMPTY !== 'ID do produto');

  const vtexIdToSlug = new Map();
  for (const r of prodRows) {
    const vtexId = r.__EMPTY;
    if (vtexIdToSlug.has(vtexId)) continue;
    let slug = r.__EMPTY_14?.toString().trim() || '';
    slug = slug.replace(/^old_/, '');
    if (slug) vtexIdToSlug.set(vtexId, slug);
  }

  // 4. For each product, insert images into media table and link to product
  let linked = 0;
  let mediaInserted = 0;

  for (const [vtexProdId, imagesMap] of prodImages) {
    const slug = vtexIdToSlug.get(vtexProdId);
    if (!slug) continue;

    const dbProductId = slugToId.get(slug);
    if (!dbProductId) continue;

    const images = [...imagesMap.values()].sort((a, b) => a.position - b.position);

    // Insert first image as main, rest as gallery
    const mediaIds = [];
    for (const img of images) {
      // Check if media with this URL already exists
      const [existing] = await sql`SELECT id FROM media WHERE url = ${img.url} LIMIT 1`;

      let mediaId;
      if (existing) {
        mediaId = existing.id;
      } else {
        const filename = img.name + (img.url.includes('.png') ? '.png' : img.url.includes('.jpg') ? '.jpg' : '.webp');
        const [inserted] = await sql`
          INSERT INTO media (filename, alt, url, mime_type, created_at)
          VALUES (${filename}, ${img.label || img.name}, ${img.url}, 'image/png', NOW())
          RETURNING id
        `;
        mediaId = inserted.id;
        mediaInserted++;
      }
      mediaIds.push(mediaId);
    }

    // First image = main (image_id), rest = gallery
    const mainImageId = mediaIds[0];
    const galleryIds = mediaIds.length > 1 ? mediaIds : null;

    await sql`
      UPDATE products
      SET image_id = ${mainImageId}, gallery_images = ${galleryIds ? JSON.stringify(galleryIds) : null}
      WHERE id = ${dbProductId}
    `;
    linked++;

    if (linked % 100 === 0) console.log(`  ...${linked} produtos vinculados`);
  }

  console.log(`\nConcluido: ${mediaInserted} midias inseridas, ${linked} produtos vinculados com imagem`);
}

run().catch(console.error);
