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
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function run() {
  const wb = XLSX.readFile('/Users/wesleymoraesserafim/Downloads/2026-05-21T20_07_08Z_produtos-e-skus_medicinalnaweb.xlsx');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

  // Skip header row
  const data = rows.filter(r => r.__EMPTY !== 'ID do produto');

  // 1. Extract unique departments (parent categories)
  const deptSet = new Map();
  const catSet = new Map();

  for (const r of data) {
    const dept = r.__EMPTY_8?.toString().trim();
    const cat = r.__EMPTY_10?.toString().trim();
    if (!dept || dept === 'Departamento') continue;

    if (!deptSet.has(dept)) {
      deptSet.set(dept, { name: dept, slug: generateSlug(dept) });
    }
    if (cat && cat !== 'Categoria' && !catSet.has(`${dept}|${cat}`)) {
      catSet.set(`${dept}|${cat}`, { name: cat, slug: generateSlug(cat), dept });
    }
  }

  console.log(`Departamentos: ${deptSet.size}, Categorias: ${catSet.size}`);

  // 2. Insert departments (parent categories)
  const deptIdMap = new Map();
  let sortOrder = 1;
  for (const [name, dept] of deptSet) {
    // Check if slug exists, append suffix if needed
    let slug = dept.slug;
    const [existing] = await sql`SELECT id FROM product_categories WHERE slug = ${slug}`;
    if (existing) {
      deptIdMap.set(name, existing.id);
      continue;
    }
    const [inserted] = await sql`
      INSERT INTO product_categories (name, slug, parent_id, sort_order, created_at, updated_at)
      VALUES (${dept.name}, ${slug}, NULL, ${sortOrder++}, NOW(), NOW())
      RETURNING id
    `;
    deptIdMap.set(name, inserted.id);
  }
  console.log(`Departamentos inseridos/existentes: ${deptIdMap.size}`);

  // 3. Insert categories (subcategories)
  const catIdMap = new Map();
  for (const [key, cat] of catSet) {
    const parentId = deptIdMap.get(cat.dept);
    // Avoid duplicate slug: prefix with dept slug
    let slug = generateSlug(`${cat.dept}-${cat.name}`);
    const [existing] = await sql`SELECT id FROM product_categories WHERE slug = ${slug}`;
    if (existing) {
      catIdMap.set(key, existing.id);
      continue;
    }
    const [inserted] = await sql`
      INSERT INTO product_categories (name, slug, parent_id, sort_order, created_at, updated_at)
      VALUES (${cat.name}, ${slug}, ${parentId}, 0, NOW(), NOW())
      RETURNING id
    `;
    catIdMap.set(key, inserted.id);
  }
  console.log(`Categorias inseridas/existentes: ${catIdMap.size}`);

  // 4. Extract unique products (dedupe by product ID, take first SKU row)
  const productMap = new Map();
  for (const r of data) {
    const prodId = r.__EMPTY;
    if (!prodId || productMap.has(prodId)) continue;
    productMap.set(prodId, r);
  }
  console.log(`Produtos unicos: ${productMap.size}`);

  // 5. Insert products
  let inserted = 0;
  let skipped = 0;
  for (const [vtexId, r] of productMap) {
    const name = r.__EMPTY_1?.toString().trim();
    if (!name) { skipped++; continue; }

    const dept = r.__EMPTY_8?.toString().trim();
    const cat = r.__EMPTY_10?.toString().trim();
    const catKey = `${dept}|${cat}`;

    // Use the most specific category (subcategory), fallback to department
    const categoryId = catIdMap.get(catKey) || deptIdMap.get(dept) || null;

    // URL: use VTEX URL field, clean prefix
    let slug = r.__EMPTY_14?.toString().trim() || generateSlug(name);
    // Remove old_ prefix if present
    slug = slug.replace(/^old_/, '');
    // Ensure valid slug
    if (!slug) slug = generateSlug(name);

    const isActive = r.__EMPTY_2 === 'Sim';
    const description = r.__EMPTY_16?.toString().trim() || r.__EMPTY_4?.toString().trim() || null;
    const contentHtml = r.__EMPTY_3?.toString().trim() || null;

    // Check slug conflict
    const [existing] = await sql`SELECT id FROM products WHERE slug = ${slug}`;
    if (existing) {
      slug = `${slug}-${vtexId}`;
      const [still] = await sql`SELECT id FROM products WHERE slug = ${slug}`;
      if (still) { skipped++; continue; }
    }

    await sql`
      INSERT INTO products (name, slug, description, content, product_category_id, product_status, featured, published_at, created_at, updated_at)
      VALUES (
        ${name},
        ${slug},
        ${description},
        ${contentHtml ? JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '__HTML__' }] }], _html: contentHtml }) : null},
        ${categoryId},
        ${isActive ? 'published' : 'draft'},
        false,
        ${isActive ? new Date().toISOString() : null},
        NOW(),
        NOW()
      )
    `;
    inserted++;
    if (inserted % 100 === 0) console.log(`  ...${inserted} produtos inseridos`);
  }

  console.log(`\nImportacao concluida: ${inserted} inseridos, ${skipped} ignorados`);
}

run().catch(console.error);
