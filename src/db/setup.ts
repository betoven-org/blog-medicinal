import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URI;
if (!DATABASE_URL) {
  console.error("DATABASE_URL or DATABASE_URI is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setup() {
  console.log("Dropping existing tables...");
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  console.log("Schema reset.");

  console.log("Applying migration...");
  const migrationPath = resolve(process.cwd(), "drizzle/0000_breezy_beyonder.sql");
  const migrationSql = readFileSync(migrationPath, "utf-8");

  // Split by statement breakpoint and execute each
  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log("Migration applied.");

  console.log("Seeding admin user...");
  const passwordHash = await bcrypt.hash("admin123", 12);
  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Admin', 'admin@medicinal.com', ${passwordHash}, 'admin')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log("Seeding site settings...");
  await sql`
    INSERT INTO site_settings (id, site_name, site_description, footer_text, copyright_text, seo_title, seo_description)
    VALUES (
      1,
      'Medicinal na Web',
      'Portal de saude, suplementos naturais, fitoterapia e bem-estar.',
      'Medicinal na Web - Seu portal de saude e bem-estar.',
      'Medicinal na Web. Todos os direitos reservados.',
      'Medicinal na Web | Portal de Saude e Bem-estar',
      'Portal de saude, suplementos naturais, fitoterapia e bem-estar.'
    )
    ON CONFLICT (id) DO NOTHING
  `;

  console.log("Setup complete! Admin: admin@medicinal.com / admin123");
}

setup().catch(console.error);
