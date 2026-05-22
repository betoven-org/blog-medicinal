import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import XLSX from 'xlsx';

const envContent = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = neon(process.env.DATABASE_URI);

async function run() {
  const wb = XLSX.readFile('/Users/wesleymoraesserafim/Downloads/2026-05-21T20_07_08Z_produtos-e-skus_medicinalnaweb.xlsx');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]).filter(r => r.__EMPTY !== 'ID do produto');

  const seen = new Set();
  let updated = 0;

  for (const r of rows) {
    const vtexId = r.__EMPTY;
    if (!vtexId || seen.has(vtexId)) continue;
    seen.add(vtexId);

    let slug = r.__EMPTY_14?.toString().trim() || '';
    slug = slug.replace(/^old_/, '');
    if (!slug) continue;

    const seoTitle = r.__EMPTY_15?.toString().trim() || null; // Titulo da pagina
    const seoDescription = r.__EMPTY_16?.toString().trim() || null; // Meta descricao
    const brand = r.__EMPTY_6?.toString().trim() || null;
    const isKit = r.__EMPTY_27 === 'Sim';
    const showOnSite = r.__EMPTY_17 === 'Sim';

    if (brand === 'Marca') continue; // header row

    const result = await sql`
      UPDATE products
      SET seo_title = ${seoTitle},
          seo_description = ${seoDescription},
          brand = ${brand},
          is_kit = ${isKit},
          show_on_site = ${showOnSite}
      WHERE slug = ${slug}
    `;
    updated++;
    if (updated % 200 === 0) console.log(`  ...${updated}`);
  }

  console.log(`Atualizado: ${updated} produtos com SEO title/description, brand, kit, showOnSite`);
}

run().catch(console.error);
